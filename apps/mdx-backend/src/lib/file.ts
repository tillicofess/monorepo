import COS from "cos-js-sdk-v5";
import SparkMD5 from "spark-md5";
import { confirmCosUpload, getCosSts } from "@/apis/largeFile";
import type { CosStsData } from "@/types/apiTypes";

const CHUNK_SIZE = 5 * 1024 * 1024;

const cosTaskMap = new Map<string, COS>();

export const createChunks = (file: File) => {
	const chunks = [];
	for (let i = 0; i < file.size; i += CHUNK_SIZE) {
		const blob = file.slice(i, i + CHUNK_SIZE);
		chunks.push(blob);
	}
	return chunks;
};

export const calculateFileHash = async (file: File): Promise<string> => {
	const cpuCores = navigator.hardwareConcurrency || 4;
	const chunkCount = cpuCores;
	const chunkSize = Math.ceil(file.size / chunkCount);

	const chunks: ArrayBuffer[] = new Array(chunkCount);
	const readers: Promise<void>[] = [];

	for (let i = 0; i < chunkCount; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, file.size);
		const blob = file.slice(start, end);

		readers.push(
			new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					chunks[i] = e.target?.result as ArrayBuffer;
					resolve();
				};
				reader.readAsArrayBuffer(blob);
			}),
		);
	}

	await Promise.all(readers);

	const hashResults: (string | null)[] = new Array(chunkCount).fill(null);

	return new Promise<string>((resolve) => {
		let completedCount = 0;

		for (let i = 0; i < chunkCount; i++) {
			const worker = new Worker(
				new URL("../workers/hashWorker.ts", import.meta.url),
				{ type: "module" },
			);

			worker.onmessage = (e) => {
				const { hash, chunkIndex } = e.data;
				hashResults[chunkIndex] = hash;
				completedCount++;

				if (completedCount === chunkCount) {
					worker.terminate();

					const combinedHash = hashResults.join("");
					const finalSpark = new SparkMD5();
					finalSpark.append(combinedHash);
					resolve(finalSpark.end());
				}
			};

			worker.postMessage({ chunk: chunks[i], chunkIndex: i });
		}
	});
};

export interface conflictInfo {
	existingFile: CosStsData["existingFile"];
	isSameHash: boolean;
}

export interface CosUploadOptions {
	file: File;
	parentId: string | null;
	onProgress?: (progress: number, speed: number) => void;
	onConflict?: (info: conflictInfo) => Promise<boolean>;
	onTaskReady?: (taskId: string) => void;
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
			(err, data) => {
				if (err) {
					console.warn("COS HeadObject Error:", err);
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
	onTaskReady,
}: CosUploadOptions): Promise<void> => {
	const fileHash = await calculateFileHash(file);

	let { data: stsResponse } = await getCosSts(
		file.name,
		parentId,
		file.size,
		fileHash,
	);

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

		const { data: overwriteData } = await getCosSts(
			file.name,
			parentId,
			file.size,
			fileHash,
			true,
		);
		stsResponse = overwriteData;
	}

	if (stsResponse.code !== 0 || !stsResponse.data?.credentials) {
		throw new Error(stsResponse.message || "获取上传凭证失败");
	}

	const { credentials, bucket, region, key, fileId } = stsResponse.data;

	if (!key || !bucket || !region || !fileId) {
		throw new Error("服务端返回的配置参数不完整");
	}

	const cos = new COS({
		SecretId: credentials.tmpSecretId,
		SecretKey: credentials.tmpSecretKey,
		SecurityToken: credentials.sessionToken,
	});

	const isExistedInCos = await checkCosFileExists(cos, bucket, region, key);

	if (isExistedInCos) {
		onProgress?.(100, 0);
		await confirmCosUpload(fileId);
		return;
	}

	await performCosUpload(
		cos,
		bucket,
		region,
		key,
		fileId,
		file,
		onProgress,
		onTaskReady,
	);
};

const performCosUpload = (
	cos: COS,
	bucket: string,
	region: string,
	key: string,
	fileId: string,
	file: File,
	onProgress?: (progress: number, speed: number) => void,
	onTaskReady?: (taskId: string) => void,
): Promise<CosUploadResult> => {
	return new Promise((resolve, reject) => {
		cos.uploadFile(
			{
				Bucket: bucket,
				Region: region,
				Key: key,
				Body: file,
				onProgress: (progressData) => {
					const progress = Math.floor(
						(progressData.loaded / progressData.total) * 100,
					);
					onProgress?.(progress, progressData.speed || 0);
				},
				onTaskReady: (taskId) => {
					cosTaskMap.set(taskId, cos);
					onTaskReady?.(taskId);
				},
			},
			async (err, data) => {
				if (err) {
					reject(err);
				} else {
					try {
						await confirmCosUpload(fileId);
						resolve({
							...(data as unknown as CosUploadResult),
							fileId,
						});
					} catch (confirmErr) {
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

export const cancelCosTask = (taskId: string) => {
	const cos = cosTaskMap.get(taskId);
	if (cos) {
		cos.cancelTask(taskId);
		cosTaskMap.delete(taskId);
	}
};

export const pauseCosTask = (taskId: string) => {
	const cos = cosTaskMap.get(taskId);
	if (cos) {
		cos.pauseTask(taskId);
	}
};

export const restartCosTask = (taskId: string) => {
	const cos = cosTaskMap.get(taskId);
	if (cos) {
		cos.restartTask(taskId);
	}
};
