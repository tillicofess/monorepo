import COS from "cos-js-sdk-v5";
import SparkMD5 from "spark-md5";
import { confirmCosUpload, getCosSts } from "@/apis/largeFile";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每个分片的大小

/**
 * 创建文件分片 (用于哈希计算抽样)
 * @param file 大文件
 * @returns 分片数组
 */
export const createChunks = (file: File) => {
	const chunks = [];
	for (let i = 0; i < file.size; i += CHUNK_SIZE) {
		const blob = file.slice(i, i + CHUNK_SIZE);
		chunks.push(blob);
	}
	return chunks;
};

/**
 * 大文件抽样计算文件哈希
 * @param chunks 文件分片数组
 * @returns 文件哈希
 */
export const calculateFileHash = async (chunks: Blob[]) => {
	return new Promise<string>((resolve) => {
		const result: Blob[] = []; //抽样分片
		const spark = new SparkMD5.ArrayBuffer();
		const fileReader = new FileReader();

		// 抽样分片：第一个分片、最后一个分片、中间分片的前、中、后各2个字节
		chunks.forEach((chunk, index) => {
			if (index === 0 || index === chunks.length - 1) {
				result.push(chunk);
			} else {
				result.push(chunk.slice(0, 2));
				result.push(chunk.slice(CHUNK_SIZE / 2, CHUNK_SIZE / 2 + 2));
				result.push(chunk.slice(CHUNK_SIZE - 2, CHUNK_SIZE));
			}
		});

		fileReader.readAsArrayBuffer(new Blob(result));
		fileReader.onload = (e) => {
			if (e.target) {
				spark.append(e.target.result as ArrayBuffer);
				resolve(spark.end());
			}
		};
	});
};

export interface CosUploadOptions {
	file: File;
	parentId: string | null;
	onProgress?: (progress: number) => void;
}

export interface CosUploadResult {
	statusCode: number;
	Location: string;
	Bucket: string;
	Key: string;
	ETag: string;
	fileId: string;
}

export const checkCosFileExists = (
	cos: COS,
	bucket: string,
	region: string,
	key: string,
): Promise<boolean> => {
	return new Promise((resolve) => {
		cos.headObject(
			{
				Bucket: bucket,
				Region: region,
				Key: key,
			},
			(err) => {
				if (err) {
					if (err.statusCode === 404) {
						resolve(false);
					} else {
						resolve(false);
					}
				} else {
					resolve(true);
				}
			},
		);
	});
};

export const calculateFullFileHash = async (file: File): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const spark = new SparkMD5.ArrayBuffer();
		const fileReader = new FileReader();

		fileReader.readAsArrayBuffer(file);
		fileReader.onload = (e) => {
			if (e.target) {
				spark.append(e.target.result as ArrayBuffer);
				resolve(spark.end());
			}
		};
		fileReader.onerror = () => {
			reject(new Error("Failed to read file for hash calculation"));
		};
	});
};

// 使用腾讯云 COS SDK 进行文件上传
export const cosUpload = async ({
	file,
	parentId,
	onProgress,
}: CosUploadOptions): Promise<CosUploadResult> => {
	const chunks = createChunks(file);
	const fileHash = await calculateFileHash(chunks);

	const { data: stsData } = await getCosSts(
		file.name,
		parentId,
		file.size,
		fileHash,
	);

	if (stsData.code !== 0) {
		throw new Error(stsData.message || "获取上传凭证失败");
	}

	const { credentials, bucket, region, key, fileId } = stsData.data;
	const { tmpSecretId, tmpSecretKey, sessionToken } = credentials;

	const cos = new COS({
		SecretId: tmpSecretId,
		SecretKey: tmpSecretKey,
		SecurityToken: sessionToken,
	});

	const exists = await checkCosFileExists(cos, bucket, region, key);

	if (exists) {
		await confirmCosUpload(fileId);
		return {
			statusCode: 200,
			Location: `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
			Bucket: bucket,
			Key: key,
			ETag: "",
			fileId,
		};
	}

	return new Promise((resolve, reject) => {
		cos.uploadFile(
			{
				Bucket: bucket,
				Region: region,
				Key: key,
				Body: file,
				onProgress: (progressData: { loaded: number; total: number }) => {
					const progress = Math.floor(
						(progressData.loaded / progressData.total) * 100,
					);
					onProgress?.(progress);
				},
			},
			async (err, data) => {
				if (err) {
					reject(err);
				} else {
					try {
						await confirmCosUpload(fileId);
						resolve({ ...(data as unknown as CosUploadResult), fileId });
					} catch (confirmErr) {
						console.error("confirmCosUpload error:", confirmErr);
						resolve({ ...(data as unknown as CosUploadResult), fileId });
					}
				}
			},
		);
	});
};
