import { http } from "@/lib/axios";
import type { ApiResponse, CosStsResponse } from "@/types/apiTypes";
import type { FileItem } from "@/views/File/types";

export type { ApiResponse, CosStsData, CosStsResponse } from "@/types/apiTypes";

/**
 * 获取文件列表
 * @param parentId 父文件夹ID
 * @returns 文件列表
 */
export const getFileList = (parentId: string | null) => {
	return http.get<ApiResponse<FileItem[]>>("/largeFile/list", {
		params: {
			parentId,
		},
	});
};

/**
 * 获取 COS 临时上传凭证
 * @param filename 文件名
 * @param parentId 父文件夹ID
 * @param fileSize 文件大小
 * @param fileHash 文件哈希
 * @param overwrite 是否覆盖同名文件
 * @returns COS 临时凭证
 */
export const getCosSts = (
	filename: string,
	parentId: string | null,
	fileSize: number,
	fileHash: string,
	overwrite?: boolean,
) => {
	return http.get<CosStsResponse>("/largeFile/sts/credentials", {
		params: { filename, parentId, fileSize, fileHash, overwrite },
	});
};

/**
 * 确认 COS 上传完成
 * @param fileId 文件ID
 * @returns 确认结果
 */
export const confirmCosUpload = (fileId: string) => {
	return http.post("/largeFile/sts/confirm", { fileId });
};

/**
 * 获取 COS 临时下载凭证
 * @param fileId 文件ID
 * @returns COS 临时下载凭证
 */
export const getCosDownloadSts = (fileId: string) => {
	return http.get<CosStsResponse>("/largeFile/sts/download/credentials", {
		params: { fileId },
	});
};

/**
 * 创建文件夹
 * @param parentId 父文件夹ID
 * @param name 文件夹名称
 * @returns 创建结果
 */
export const createFolder = (parentId: string | null, name: string) => {
	return http.post(
		"/largeFile/createFolder",
		{
			parentId,
			name,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
};

/**
 * 重命名文件
 * @param id 文件ID
 * @param name 新文件名
 * @returns 重命名结果
 */
export const renameFile = (id: string, name: string) => {
	return http.post(
		"/largeFile/rename",
		{
			id,
			name,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
};

/**
 * 删除文件
 * @param id 文件ID
 * @returns 删除结果
 */
export const deleteFile = (id: string) => {
	return http.delete(`/largeFile/delete/${id}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
};

/**
 * 移动文件或文件夹
 * @param id 文件或文件夹ID
 * @param newParentId 新父文件夹ID
 * @returns 移动结果
 */
export const moveFileOrFolder = (
	draggedId: string,
	newParentId: string | null,
) => {
	return http.post(
		"/largeFile/move",
		{
			draggedId,
			newParentId,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
};

/**
 * 下载文件
 * @param fileId 文件ID
 */
export const downloadFile = async (fileId: string) => {
	const { data: stsResponse } = await getCosDownloadSts(fileId);

	if (stsResponse.code !== 0 || !stsResponse.data?.credentials) {
		throw new Error(stsResponse.message || "获取下载凭证失败");
	}

	const { credentials, bucket, region, key } = stsResponse.data;

	if (!credentials || !bucket || !region || !key) {
		throw new Error("服务端返回的配置参数不完整");
	}

	const COS = (await import("cos-js-sdk-v5")).default;

	const cos = new COS({
		SecretId: credentials.tmpSecretId,
		SecretKey: credentials.tmpSecretKey,
		SecurityToken: credentials.sessionToken,
	});

	cos.getObjectUrl(
		{
			Bucket: bucket,
			Region: region,
			Key: key,
			Sign: true,
		},
		(err, data) => {
			if (err) {
				console.error("获取下载链接失败:", err);
				return;
			}
			const downloadUrl =
				data.Url +
				(data.Url.indexOf("?") > -1 ? "&" : "?") +
				"response-content-disposition=attachment";
			window.open(downloadUrl);
		},
	);
};
