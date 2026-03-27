/**
 * 文件管理模块 - COS 直传上传核心库
 *
 * 架构设计说明：
 * 1. 前端计算文件抽样 Hash，用于秒传检测
 * 2. 后端根据 Hash 检查数据库，判断是否可秒传或需要覆盖确认
 * 3. 前端获取 STS 临时凭证后直传 COS
 * 4. 上传完成后通知后端更新数据库状态
 *
 * 术语解释：
 * - STS: 腾讯云临时密钥服务 (Security Token Service)
 * - COS: 对象存储 (Cloud Object Storage)
 * - 秒传: 文件内容已存在时，直接复用已有 COS 对象，跳过实际上传
 * - 覆盖: 同名文件被新文件替换，旧记录惰性删除
 */

import COS from "cos-js-sdk-v5";
import SparkMD5 from "spark-md5";
import { type CosStsData, confirmCosUpload, getCosSts } from "@/apis/largeFile";

/**
 * 分片大小常量
 * 5MB = 5 * 1024 * 1024 字节
 * 用于：
 * 1. 创建分片进行抽样哈希计算
 * 2. COS SDK 内部会自动处理分片上传逻辑
 */
const CHUNK_SIZE = 5 * 1024 * 1024;

/**
 * 将文件切割为固定大小的分片
 *
 * @param file - 原始文件对象 (File API)
 * @returns 分片数组 (Blob[])
 *
 * @example
 * const file = new File([...], "test.pdf");
 * const chunks = createChunks(file);
 * // 返回: [Blob{0-5MB}, Blob{5MB-10MB}, ...]
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
 * 抽样计算文件内容的 MD5 哈希值
 *
 * 为什么需要抽样？
 * - 全量计算大文件哈希会导致浏览器主线程阻塞
 * - 抽样策略：在保证区分度的前提下大幅降低计算量
 *
 * 抽样规则：
 * - 首尾分片：全量保留（首尾包含关键文件头/尾信息）
 * - 中间分片：仅取头部2字节 + 中间2字节 + 尾部2字节
 *
 * @param chunks - 文件分片数组
 * @returns 文件哈希字符串 (32位 MD5)
 *
 * @example
 * const chunks = createChunks(file);
 * const hash = await calculateFileHash(chunks);
 * // 返回: "a1b2c3d4e5f6..."
 */
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

/**
 * 冲突信息类型
 *
 * 当检测到同名文件时，传递给 UI 层的信息结构
 *
 * @example
 * {
 *   existingFile: { id, name, cosKey, fileHash, size, fileType, createdAt },
 *   isSameHash: false  // 是否与已存在文件的 Hash 相同
 * }
 */
export interface conflictInfo {
	/** 已存在文件的完整信息 */
	existingFile: CosStsData["existingFile"];
	/** 新上传文件与已存在文件的 Hash 是否相同 */
	isSameHash: boolean;
}

/**
 * cosUpload 函数的可选参数
 *
 * @example
 * cosUpload({
 *   file: selectedFile,
 *   parentId: currentFolderId,
 *   onProgress: (p) => setProgress(p),
 *   onConflict: (info) => showConfirmModal(info)
 * })
 */
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

/**
 * cosUpload 函数的返回值类型
 */
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
	/** 是否为秒传成功 (内容重复，未实际上传) */
	isInstantUpload?: boolean;
}

/**
 * 检查文件是否已存在于腾讯云 COS
 *
 * 实现原理：
 * - 使用 COS 的 headObject API
 * - 该 API 只获取文件元数据，不下载文件实体
 * - 状态码 404 表示文件不存在，其他情况视为存在
 *
 * @param cos - COS SDK 实例
 * @param bucket - 存储桶名称
 * @param region - 存储桶地域
 * @param key - COS 对象键
 * @returns Promise<boolean> - 文件是否存在
 *
 * @example
 * const exists = await checkCosFileExists(cos, 'mybucket', 'ap-guangzhou', 'file/abc.pdf');
 * if (exists) {
 *   console.log('文件已存在，可秒传');
 * }
 */
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
				// err 存在且 statusCode 为 404 表示文件不存在
				// 其他情况（包括网络错误）统一视为文件存在，走实际上传逻辑
				resolve(!err || err.statusCode !== 404);
			},
		);
	});
};

/**
 * COS 客户端信息包装类型
 *
 * 包含直传 COS 所需的所有必要信息
 */
interface CosClientInfo {
	/** COS SDK 实例 */
	cos: COS;
	/** 存储桶名称 */
	bucket: string;
	/** 地域，如 ap-guangzhou */
	region: string;
	/** 对象键，文件在 COS 中的唯一标识 */
	key: string;
	/** 数据库记录 ID */
	fileId: string;
}

/**
 * 从 STS 临时凭证创建 COS 客户端
 *
 * @param credentials - STS 返回的临时凭证
 *   - tmpSecretId: 临时 SecretId
 *   - tmpSecretKey: 临时 SecretKey
 *   - sessionToken: 临时会话令牌
 * @param bucket - 存储桶名称
 * @param region - 地域
 * @param key - 对象键
 * @param fileId - 数据库记录 ID
 * @returns CosClientInfo 包装对象
 */
const createCosClient = (
	credentials: {
		tmpSecretId: string;
		tmpSecretKey: string;
		sessionToken: string;
	},
	bucket: string,
	region: string,
	key: string,
	fileId: string,
): CosClientInfo => {
	const cos = new COS({
		SecretId: credentials.tmpSecretId,
		SecretKey: credentials.tmpSecretKey,
		SecurityToken: credentials.sessionToken,
	});
	return { cos, bucket, region, key, fileId };
};

/**
 * 执行实际的 COS 文件上传
 *
 * 使用 COS SDK 的 uploadFile 方法：
 * - 自动处理分片上传（大文件会自动分片）
 * - 支持断点续传
 * - 提供上传进度回调
 *
 * @param cos - COS SDK 实例
 * @param bucket - 存储桶名称
 * @param region - 地域
 * @param key - 对象键
 * @param fileId - 数据库记录 ID
 * @param file - 要上传的文件
 * @param onProgress - 进度回调
 * @returns Promise<CosUploadResult>
 */
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

/**
 * 构建统一的返回值对象
 *
 * @param bucket - 存储桶名称
 * @param region - 地域
 * @param key - 对象键
 * @param fileId - 数据库记录 ID
 * @returns CosUploadResult
 */
const buildResult = (
	bucket: string,
	region: string,
	key: string,
	fileId: string,
): CosUploadResult => ({
	statusCode: 200,
	Location: `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
	Bucket: bucket,
	Key: key,
	ETag: "",
	fileId,
});

/**
 * 核心上传函数：腾讯云 COS 直传
 *
 * 完整流程：
 * 1. 计算文件抽样 Hash
 * 2. 请求后端获取 STS 凭证，后端检查是否可秒传或需覆盖确认
 * 3a. 情况A (code=2): 秒传 - 直接复用已有记录
 * 3b. 情况B (code=3): 覆盖确认 - 询问用户后执行覆盖上传
 * 3c. 情况C (code=0): 正常上传 - 检查 COS 对象是否存在后上传
 *
 * @param options - 上传配置项
 * @returns Promise<CosUploadResult>
 *
 * @example
 * try {
 *   const result = await cosUpload({
 *     file: selectedFile,
 *     parentId: folderId,
 *     onProgress: (p) => setProgress(p),
 *     onConflict: async (info) => {
 *       return await Modal.confirm({...});
 *     }
 *   });
 *   console.log('上传成功', result);
 * } catch (error) {
 *   console.error('上传失败', error);
 * }
 */
export const cosUpload = async ({
	file,
	parentId,
	onProgress,
	onConflict,
}: CosUploadOptions): Promise<CosUploadResult> => {
	// ========== 步骤1: 计算文件 Hash ==========
	const chunks = createChunks(file);
	const fileHash = await calculateFileHash(chunks);

	// ========== 步骤2: 请求后端获取上传凭证 ==========
	// 后端会根据 Hash 检查：
	// - 是否存在相同内容的文件 (秒传)
	// - 是否存在同名文件 (覆盖确认)
	const { data: stsData } = await getCosSts(
		file.name,
		parentId,
		file.size,
		fileHash,
	);

	// ========== 情况A: 秒传 (code=2) ==========
	// 后端发现数据库中已有相同 Hash 的文件记录
	// 此时 COS 对象必定存在，直接复用即可
	if (
		stsData.code === 2 &&
		stsData.data.skipUpload &&
		stsData.data.existingFile
	) {
		onProgress?.(100); // 进度拉满
		return {
			statusCode: 200,
			Location: `https://${stsData.data.existingFile.cosKey}`,
			Bucket: "",
			Key: stsData.data.existingFile.cosKey,
			ETag: "",
			fileId: stsData.data.existingFile.id,
			isInstantUpload: true, // 标记为秒传
		};
	}

	// ========== 情况B: 同名冲突需确认 (code=3) ==========
	// 后端发现当前目录下有同名文件，需要用户确认是否覆盖
	if (
		stsData.code === 3 &&
		stsData.data.conflict &&
		stsData.data.existingFile
	) {
		// 如果没有提供冲突处理回调，直接抛出错误
		if (!onConflict) {
			throw new Error(stsData.message || "存在同名文件，需要确认是否覆盖");
		}

		// 询问用户是否覆盖
		const shouldOverwrite = await onConflict({
			existingFile: stsData.data.existingFile,
			isSameHash: stsData.data.isSameHash ?? false,
		});

		// 用户取消覆盖，中断上传
		if (!shouldOverwrite) {
			throw new Error("用户取消覆盖");
		}

		// ========== 用户确认覆盖，重新获取凭证 ==========
		// 携带 overwrite=true 参数，告诉后端执行覆盖逻辑
		const { data: overwriteStsData } = await getCosSts(
			file.name,
			parentId,
			file.size,
			fileHash,
			true, // overwrite = true
		);

		// 验证凭证有效性
		if (overwriteStsData.code !== 0 || !overwriteStsData.data.credentials) {
			throw new Error(overwriteStsData.message || "获取上传凭证失败");
		}

		const { credentials, bucket, region, key, fileId } = overwriteStsData.data;

		// 参数校验
		if (!key || !bucket || !region || !fileId) {
			throw new Error("服务端返回的覆盖上传凭证缺少必要参数");
		}

		// 创建 COS 客户端
		const clientInfo = createCosClient(
			credentials,
			bucket,
			region,
			key,
			fileId,
		);

		// 再次检查 COS 对象是否存在
		// 注意：同 Hash 覆盖时，对象必然存在，可跳过实际上传
		const exists = await checkCosFileExists(
			clientInfo.cos,
			clientInfo.bucket,
			clientInfo.region,
			clientInfo.key,
		);

		// COS 对象已存在（通常是因为同 Hash 覆盖）
		if (exists) {
			onProgress?.(100);
			await confirmCosUpload(fileId);
			return buildResult(bucket, region, key, fileId);
		}

		// COS 对象不存在（不同 Hash 覆盖），执行实际上传
		return performCosUpload(
			clientInfo.cos,
			clientInfo.bucket,
			clientInfo.region,
			clientInfo.key,
			clientInfo.fileId,
			file,
			onProgress,
		);
	}

	// ========== 情况C: 正常上传流程 (code=0) ==========
	// 后端检查通过，返回合法的上传凭证
	if (stsData.code !== 0 || !stsData.data.credentials) {
		throw new Error(stsData.message || "获取上传凭证失败");
	}

	const { credentials, bucket, region, key, fileId } = stsData.data;

	// 参数校验
	if (!key || !bucket || !region || !fileId) {
		throw new Error("服务端返回的上传凭证缺少必要参数");
	}

	// 创建 COS 客户端
	const clientInfo = createCosClient(credentials, bucket, region, key, fileId);

	// 检查 COS 对象是否已存在（防止重复上传）
	// 可能存在情况：之前上传过但数据库记录丢失，而 COS 对象仍存在
	const exists = await checkCosFileExists(
		clientInfo.cos,
		clientInfo.bucket,
		clientInfo.region,
		clientInfo.key,
	);

	// COS 对象已存在，跳过实际上传
	if (exists) {
		await confirmCosUpload(fileId);
		return buildResult(bucket, region, key, fileId);
	}

	// 执行实际上传
	return performCosUpload(
		clientInfo.cos,
		clientInfo.bucket,
		clientInfo.region,
		clientInfo.key,
		clientInfo.fileId,
		file,
		onProgress,
	);
};
