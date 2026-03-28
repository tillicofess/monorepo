import COS from "cos-js-sdk-v5";
import SparkMD5 from "spark-md5";
import { type CosStsData, confirmCosUpload, getCosSts } from "@/apis/largeFile";

const CHUNK_SIZE = 5 * 1024 * 1024;

export const createChunks = (file: File) => {
	const chunks = [];
	for (let i = 0; i < file.size; i += CHUNK_SIZE) {
		const blob = file.slice(i, i + CHUNK_SIZE);
		chunks.push(blob);
	}
	return chunks;
};

export const calculateFileHash = async (chunks: Blob[]) => {
	return new Promise<string>((resolve) => {
		const result: Blob[] = [];
		const spark = new SparkMD5.ArrayBuffer();
		const fileReader = new FileReader();

		// 按规则对每个分片进行抽样
		chunks.forEach((chunk, index) => {
			if (index === 0 || index === chunks.length - 1) {
				// 首尾分片：完整保留
				result.push(chunk);
			} else {
				// 中间分片：取头部、中间、尾部各2字节
				result.push(chunk.slice(0, 2)); // 头部
				result.push(chunk.slice(CHUNK_SIZE / 2, CHUNK_SIZE / 2 + 2)); // 中间
				result.push(chunk.slice(CHUNK_SIZE - 2, CHUNK_SIZE)); // 尾部
			}
		});

		// 将抽样数据合并后计算 MD5
		fileReader.readAsArrayBuffer(new Blob(result));
		fileReader.onload = (e) => {
			if (e.target) {
				spark.append(e.target.result as ArrayBuffer);
				resolve(spark.end());
			}
		};
	});
};

export interface conflictInfo {
	/** 已存在文件的完整信息 */
	existingFile: CosStsData["existingFile"];
	/** 新上传文件与已存在文件的 Hash 是否相同 */
	isSameHash: boolean;
}

export interface CosUploadOptions {
	/** 要上传的文件对象 */
	file: File;
	/** 上传到哪个文件夹，null 表示根目录 */
	parentId: string | null;
	/** 上传进度回调，0-100 */
	onProgress?: (progress: number) => void;
	/** 同名冲突确认回调，返回用户是否确认覆盖 */
	onConflict?: (info: conflictInfo) => Promise<boolean>;
}

export interface CosUploadResult {
	/** HTTP 状态码，通常为 200 */
	statusCode: number;
	/** 文件的完整访问 URL */
	Location: string;
	/** COS 存储桶名称 */
	Bucket: string;
	/** COS 对象键 (文件在存储桶中的唯一标识) */
	Key: string;
	/** 文件的 ETag，通常是 MD5 值的十六进制表示 */
	ETag: string;
	/** 数据库记录 ID */
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
			(err, data) => {
				if (err) {
					// 打印错误详情，这是排查问题的关键！
					console.warn("COS HeadObject Error:", err);
					// 如果是 404 说明文件确实不存在
					// 如果是 403 说明权限不足，此时你无法判断文件是否存在
					resolve(false);
				} else if (data) {
					resolve(true);
				}
			},
		);
	});
};

export const cosUpload = async ({
	file,
	parentId,
	onProgress,
	onConflict,
}: CosUploadOptions): Promise<void> => {
	// 1. 预处理：计算 Hash (消耗性能的操作建议放在最前或按需触发)
	const chunks = createChunks(file);
	const fileHash = await calculateFileHash(chunks);

	// 2. 获取初始凭证
	let { data: stsResponse } = await getCosSts(
		file.name,
		parentId,
		file.size,
		fileHash,
	);

	// 3. 处理冲突情况 (Code 3)
	if (
		stsResponse.code === 3 &&
		stsResponse.data.conflict &&
		stsResponse.data.existingFile
	) {
		if (!onConflict) {
			throw new Error(stsResponse.message || "存在同名文件，请处理冲突");
		}

		const shouldOverwrite = await onConflict({
			existingFile: stsResponse.data.existingFile,
			isSameHash: !!stsResponse.data.isSameHash,
		});

		if (!shouldOverwrite) throw new Error("用户取消覆盖");

		// 覆盖模式：重新请求带 overwrite 标志的凭证
		const { data: overwriteData } = await getCosSts(
			file.name,
			parentId,
			file.size,
			fileHash,
			true,
		);
		stsResponse = overwriteData;
	}

	// 4. 最终状态校验 (处理 Code 0 或覆盖后的结果)
	if (stsResponse.code !== 0 || !stsResponse.data?.credentials) {
		throw new Error(stsResponse.message || "获取上传凭证失败");
	}

	// 5. 执行核心上传流程
	const { credentials, bucket, region, key, fileId } = stsResponse.data;

	if (!key || !bucket || !region || !fileId) {
		throw new Error("服务端返回的配置参数不完整");
	}

	const cos = new COS({
		SecretId: credentials.tmpSecretId,
		SecretKey: credentials.tmpSecretKey,
		SecurityToken: credentials.sessionToken,
	});

	// 检查是否可以秒传 (COS 中已存在该文件)
	console.log("setResponse.data:", stsResponse.data);
	const isExistedInCos = await checkCosFileExists(cos, bucket, region, key);

	console.log("文件是否已存在于 COS 中:", isExistedInCos);

	if (isExistedInCos) {
		onProgress?.(100);
		await confirmCosUpload(fileId);
		return;
	}

	// 执行实际的分片或简单上传
	await performCosUpload(cos, bucket, region, key, fileId, file, onProgress);
};

const performCosUpload = (
	cos: COS,
	bucket: string,
	region: string,
	key: string,
	fileId: string,
	file: File,
	onProgress?: (progress: number) => void,
): Promise<CosUploadResult> => {
	return new Promise((resolve, reject) => {
		cos.uploadFile(
			{
				Bucket: bucket,
				Region: region,
				Key: key,
				Body: file,
				onProgress: (progressData) => {
					// 计算上传进度百分比
					const progress = Math.floor(
						(progressData.loaded / progressData.total) * 100,
					);
					onProgress?.(progress);
				},
			},
			async (err, data) => {
				if (err) {
					// 上传失败
					reject(err);
				} else {
					// 上传成功，通知后端更新数据库状态
					try {
						await confirmCosUpload(fileId);
						resolve({
							...(data as unknown as CosUploadResult),
							fileId,
						});
					} catch (confirmErr) {
						// 确认通知失败不影响上传成功状态，打印日志后仍返回成功
						console.error("confirmCosUpload error:", confirmErr);
						resolve({
							...(data as unknown as CosUploadResult),
							fileId,
						});
					}
				}
			},
		);
	});
};
