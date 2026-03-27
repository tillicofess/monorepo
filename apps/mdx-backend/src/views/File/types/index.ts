import type React from "react";

export interface FileItem {
	id: string;
	name: string;
	size: number;
	uploadTime: string;
	isDir: boolean;
	cosKey?: string;
	fileHash?: string;
	fileType?: string;
	parentId?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface BreadcrumbItem {
	id: string | null;
	name: React.ReactNode;
}

export interface FileNameState {
	id: string;
	name: string;
}

export interface DeleteFileState {
	id: string;
	name: string;
	isDir: boolean;
}

export interface DeleteMultipleState {
	ids: string[];
	names: string[];
	isDirs: boolean[];
}

export interface UploadModalProps {
	parentId: string | null;
	onSuccess: () => void;
}

export interface CreateFolderModalProps {
	parentId: string | null;
	onSuccess: () => void;
}

export interface RenameModalProps {
	onSuccess: () => void;
}

export interface DeleteConfirmModalProps {
	onSuccess: () => void;
}

export interface FileTableProps {
	fileList: FileItem[] | undefined;
	isLoading: boolean;
	onEnterFolder: (record: FileItem) => void;
	onRename: (id: string, name: string) => void;
	onDelete: (id: string, name: string, isDir: boolean) => void;
}
