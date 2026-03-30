import type { FileItem } from "./file";

/**
 * 重命名弹窗状态
 */
export interface FileNameState {
	/** 文件 ID */
	id: string;
	/** 文件原名 */
	name: string;
}

/**
 * 单文件删除确认弹窗状态
 */
export interface DeleteFileState {
	/** 文件 ID */
	id: string;
	/** 文件名 */
	name: string;
	/** 是否为文件夹 */
	isDir: boolean;
}

/**
 * 批量删除确认弹窗状态
 */
export interface DeleteMultipleState {
	/** 待删除文件 ID 列表 */
	ids: string[];
	/** 待删除文件名列表 */
	names: string[];
	/** 对应项是否为文件夹 */
	isDirs: boolean[];
}

/**
 * 上传弹窗属性
 * @example <UploadModal parentId={null} onSuccess={refreshFileList} />
 */
export interface UploadModalProps {
	/** 上传到目标文件夹，null 表示根目录 */
	parentId: string | null;
	/** 上传成功回调 */
	onSuccess: () => void;
}

/**
 * 创建文件夹弹窗属性
 */
export interface CreateFolderModalProps {
	/** 在哪个文件夹下创建，null 表示根目录 */
	parentId: string | null;
	/** 创建成功回调 */
	onSuccess: () => void;
}

/**
 * 重命名弹窗属性
 */
export interface RenameModalProps {
	/** 重命名成功回调 */
	onSuccess: () => void;
}

/**
 * 删除确认弹窗属性
 */
export interface DeleteConfirmModalProps {
	/** 删除成功回调 */
	onSuccess: () => void;
}

/**
 * 文件表格属性
 */
export interface FileTableProps {
	/** 文件列表数据 */
	fileList: FileItem[] | undefined;
	/** 加载状态 */
	isLoading: boolean;
	/** 进入文件夹回调 */
	onEnterFolder: (record: FileItem) => void;
	/** 点击重命名回调 */
	onRename: (id: string, name: string) => void;
	/** 点击删除回调 */
	onDelete: (id: string, name: string, isDir: boolean) => void;
}
