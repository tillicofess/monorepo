/**
 * 文件列表项
 * 从后端获取的文件数据实体
 */
export interface FileItem {
	/** 文件唯一标识 (UUID) */
	id: string;
	/** 文件名 */
	name: string;
	/** 文件大小 (字节) */
	size: number;
	/** 上传时间 */
	uploadTime: string;
	/** 是否为文件夹 */
	isDir: boolean;
	/** COS 存储键 */
	cosKey?: string;
	/** 文件哈希值 (用于秒传) */
	fileHash?: string;
	/** 文件扩展名 (不含点，如 'jpg', 'png') */
	fileType?: string;
	/** 父文件夹 ID，null 表示根目录 */
	parentId?: string | null;
	/** 创建时间 */
	createdAt?: string;
	/** 更新时间 */
	updatedAt?: string;
}

/**
 * 面包屑导航项
 * 用于文件路径展示
 * @example { id: null, name: '根目录' }
 */
export interface BreadcrumbItem {
	/** 文件夹 ID，null 表示根目录 */
	id: string | null;
	/** 显示名称 */
	name: React.ReactNode;
}
