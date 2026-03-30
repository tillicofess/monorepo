import type {
	DeleteFileState,
	DeleteMultipleState,
	FileNameState,
} from "./modal";

/**
 * 上传任务状态
 * - pending: 等待上传
 * - uploading: 上传中
 * - completed: 上传完成
 * - failed: 上传失败
 * - cancelled: 用户取消
 * - paused: 已暂停
 */
export type UploadStatus =
	| "pending"
	| "uploading"
	| "completed"
	| "failed"
	| "cancelled"
	| "paused";

/**
 * 上传任务单元
 * 对应队列中的一个文件上传任务
 */
export interface UploadTask {
	/** 任务唯一 ID (本地生成) */
	id: string;
	/** 要上传的文件对象 */
	file: File;
	/** 上传进度 (0-100) */
	progress: number;
	/** 上传速度 (字节/秒) */
	speed: number;
	/** 任务状态 */
	status: UploadStatus;
	/** 错误信息 (失败时) */
	error?: string;
	/** COS SDK 返回的任务 ID (用于暂停/取消/恢复) */
	cosTaskId?: string;
}

/**
 * 文件管理 Store 完整状态类型
 * 包含 createFolder, upload, rename, delete 四个子状态
 */
export interface FileStoreState {
	/** 已选中的文件行 keys (用于批量操作) */
	selectedRowKeys: React.Key[];
	setSelectedRowKeys: (keys: React.Key[]) => void;
	clearSelectedRowKeys: () => void;

	/** 创建文件夹相关状态 */
	createFolder: {
		isOpen: boolean;
		name: string;
		loading: boolean;
		setName: (name: string) => void;
		open: () => void;
		close: () => void;
		submit: (parentId: string | null, onSuccess: () => void) => Promise<void>;
	};

	/** 文件上传相关状态 */
	upload: {
		isModalOpen: boolean;
		queue: UploadTask[];
		maxConcurrent: number;
		fileInputRef: React.RefObject<HTMLInputElement | null>;
		openModal: () => void;
		closeModal: () => void;
		addFiles: (files: File[]) => void;
		removeTask: (taskId: string) => void;
		startUpload: (
			parentId: string | null,
			onSuccess: () => void,
		) => Promise<void>;
		pauseTask: (taskId: string) => void;
		resumeTask: (taskId: string, parentId: string | null) => Promise<void>;
		cancelTask: (taskId: string) => void;
		retryTask: (taskId: string, parentId: string | null) => Promise<void>;
	};

	/** 重命名相关状态 */
	rename: {
		isOpen: boolean;
		fileName: FileNameState;
		loading: boolean;
		setFileName: (fn: FileNameState) => void;
		open: (id: string, name: string) => void;
		close: () => void;
		submit: (onSuccess: () => void) => Promise<void>;
	};

	/** 删除相关状态 */
	delete: {
		isOpen: boolean;
		fileInfo: DeleteFileState;
		multiple: DeleteMultipleState;
		loading: boolean;
		open: (id: string, name: string, isDir: boolean) => void;
		openMultiple: (ids: string[], names: string[], isDirs: boolean[]) => void;
		close: () => void;
		submit: (onSuccess: () => void) => Promise<void>;
	};
}
