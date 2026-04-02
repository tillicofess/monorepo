/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
	/** 状态码，0 表示成功 */
	code: number;
	/** 响应消息 */
	message: string;
	/** 响应数据 */
	data: T;
}

/**
 * COS 临时凭证响应
 * 获取上传凭证接口的返回格式
 */
export interface CosStsResponse {
	code: number;
	message: string;
	data: CosStsData;
}

/**
 * COS 凭证数据
 */
export interface CosStsData {
	/** 临时密钥信息 */
	credentials?: {
		tmpSecretId: string;
		tmpSecretKey: string;
		sessionToken: string;
	};
	/** 凭证过期时间 */
	expiredTime?: number;
	/** 凭证开始时间 */
	startTime?: number;
	/** COS 存储桶名称 */
	bucket?: string;
	/** COS 地域 */
	region?: string;
	/** COS 对象键 */
	key?: string;
	/** 数据库文件记录 ID */
	fileId?: string;
	/** 是否跳过上传（秒传成功时为 true） */
	skipUpload?: boolean;
	/** 是否存在同名文件冲突 */
	conflict?: boolean;
	/** 冲突文件与新文件的 hash 是否相同 */
	isSameHash?: boolean;
	/** 冲突文件的详细信息 */
	existingFile?: {
		id: string;
		name: string;
		cosKey: string;
		fileHash: string;
		size: number;
		fileType: string;
		createdAt: string;
	};
	/** 文件名（下载凭证返回） */
	fileName?: string;
}
