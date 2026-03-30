import { Modal, message } from "antd";
import { create } from "zustand";
import { createFolder, deleteFile, renameFile } from "@/apis/index";
import {
	cancelCosTask,
	cosUpload,
	pauseCosTask,
	restartCosTask,
} from "@/lib/file";
import { formatMessage } from "@/lib/intl";
import type {
	DeleteFileState,
	DeleteMultipleState,
	FileNameState,
	UploadStatus,
	UploadTask,
} from "../types";

interface FileStoreState {
	selectedRowKeys: React.Key[];
	setSelectedRowKeys: (keys: React.Key[]) => void;
	clearSelectedRowKeys: () => void;
	createFolder: {
		isOpen: boolean;
		name: string;
		loading: boolean;
		setName: (name: string) => void;
		open: () => void;
		close: () => void;
		submit: (parentId: string | null, onSuccess: () => void) => Promise<void>;
	};
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
	rename: {
		isOpen: boolean;
		fileName: FileNameState;
		loading: boolean;
		setFileName: (name: FileNameState) => void;
		open: (id: string, name: string) => void;
		close: () => void;
		submit: (onSuccess: () => void) => Promise<void>;
	};
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

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useFileStore = create<FileStoreState>((set, get) => ({
	selectedRowKeys: [],
	setSelectedRowKeys: (keys) => set({ selectedRowKeys: keys }),
	clearSelectedRowKeys: () => set({ selectedRowKeys: [] }),
	createFolder: {
		isOpen: false,
		name: "",
		loading: false,
		setName: (name) =>
			set((state) => ({ createFolder: { ...state.createFolder, name } })),
		open: () =>
			set((state) => ({
				createFolder: { ...state.createFolder, isOpen: true },
			})),
		close: () =>
			set((state) => ({
				createFolder: { ...state.createFolder, isOpen: false, name: "" },
			})),
		submit: async (parentId, onSuccess) => {
			const { createFolder: cf } = get();
			if (!cf.name.trim()) return;

			set((state) => ({
				createFolder: { ...state.createFolder, loading: true },
			}));
			try {
				const res = await createFolder(parentId, cf.name.trim());
				message.success(
					formatMessage("createFolderSuccess", { name: res.data.data.name }),
				);
				get().createFolder.close();
				onSuccess();
			} catch (error) {
				console.error("createFolderError:", error);
				message.error(formatMessage("createFolderError"));
			} finally {
				set((state) => ({
					createFolder: { ...state.createFolder, loading: false },
				}));
			}
		},
	},
	upload: {
		isModalOpen: false,
		queue: [],
		maxConcurrent: 1,
		fileInputRef: { current: null },
		openModal: () =>
			set((state) => ({ upload: { ...state.upload, isModalOpen: true } })),
		closeModal: () => {
			set((state) => ({
				upload: {
					...state.upload,
					isModalOpen: false,
					queue: [],
					fileInputRef: { current: null },
				},
			}));
		},
		// 添加文件任务
		addFiles: (files: File[]) => {
			const newTasks: UploadTask[] = files.map((file) => ({
				id: generateId(),
				file,
				progress: 0,
				speed: 0,
				status: "pending",
			}));
			set((state) => ({
				upload: {
					...state.upload,
					queue: [...state.upload.queue, ...newTasks],
				},
			}));
		},
		// 移除任务
		removeTask: (taskId: string) => {
			set((state) => ({
				upload: {
					...state.upload,
					queue: state.upload.queue.filter((t) => t.id !== taskId),
				},
			}));
		},
		// 开始上传
		startUpload: async (parentId: string | null, onSuccess: () => void) => {
			const { upload } = get();
			// 1. 获取所有待上传任务
			const pendingTasks = upload.queue.filter((t) => t.status === "pending");

			if (pendingTasks.length === 0) {
				message.warning(formatMessage("noFilesToUpload"));
				return;
			}

			/**
			 * 更新单个任务状态的辅助函数
			 */
			const updateTask = (taskId: string, payload: Partial<UploadTask>) => {
				set((state) => ({
					upload: {
						...state.upload,
						queue: state.upload.queue.map((t) =>
							t.id === taskId ? { ...t, ...payload } : t,
						),
					},
				}));
			};

			/**
			 * 执行单个上传逻辑
			 */
			const runTask = async (task: UploadTask) => {
				try {
					updateTask(task.id, { status: "uploading", progress: 0 });

					await cosUpload({
						file: task.file,
						parentId,
						onProgress: (progress, speed) => {
							updateTask(task.id, { progress, speed });
						},
						onConflict: async (info) => {
							return new Promise((resolve) => {
								Modal.confirm({
									title: formatMessage("overwriteConfirmTitle"),
									content: info.isSameHash
										? formatMessage("overwriteConfirmContentSameHash", {
												existingName: info.existingFile?.name || "",
											})
										: formatMessage("overwriteConfirmContent", {
												existingName: info.existingFile?.name || "",
												newName: task.file.name,
											}),
									onOk: () => resolve(true),
									onCancel: () => resolve(false),
								});
							});
						},
						onTaskReady: (cosTaskId) => updateTask(task.id, { cosTaskId }),
					});

					updateTask(task.id, { status: "completed", progress: 100 });
					message.success(
						formatMessage("uploadSuccess", { name: task.file.name }),
					);
				} catch (error: any) {
					const isCancel =
						error?.message === "用户取消覆盖" || error?.name === "AbortError";
					updateTask(task.id, {
						status: isCancel ? "cancelled" : "failed",
						progress: isCancel ? 0 : task.progress,
					});

					if (!isCancel) {
						console.error("Upload error:", error);
						message.error(
							formatMessage("uploadError", { name: task.file.name }),
						);
					}
				}
			};

			/**
			 * 顺序执行器 (严格一个接一个)
			 */
			const executeSequentially = async () => {
				// 重新获取最新的 queue 以免闭包引用旧数据
				const tasksToProcess = get().upload.queue.filter(
					(t) => t.status === "pending",
				);

				for (const task of tasksToProcess) {
					await runTask(task);
					// 可以在这里插入一小段延迟，防止 UI 过于频繁闪烁
				}

				// 所有任务尝试完毕后触发
				onSuccess();
			};

			// 启动顺序上传
			executeSequentially();
		},
		// 暂停任务
		pauseTask: (taskId: string) => {
			const { upload: up } = get();
			const task = up.queue.find((t) => t.id === taskId);
			if (task?.cosTaskId) {
				pauseCosTask(task.cosTaskId);
			}
			set((state) => ({
				upload: {
					...state.upload,
					queue: state.upload.queue.map((t) =>
						t.id === taskId
							? {
									...t,
									status: "paused" as UploadStatus,
								}
							: t,
					),
				},
			}));
		},
		// 继续任务
		resumeTask: async (taskId: string, _parentId: string | null) => {
			const { upload: up } = get();
			const task = up.queue.find((t) => t.id === taskId);
			if (task?.cosTaskId) {
				restartCosTask(task.cosTaskId);
			}
			set((state) => ({
				upload: {
					...state.upload,
					queue: state.upload.queue.map((t) =>
						t.id === taskId ? { ...t, status: "uploading" as UploadStatus } : t,
					),
				},
			}));
		},
		// 取消任务
		cancelTask: (taskId: string) => {
			const { upload: up } = get();
			const task = up.queue.find((t) => t.id === taskId);
			if (task?.cosTaskId) {
				cancelCosTask(task.cosTaskId);
			}
			set((state) => ({
				upload: {
					...state.upload,
					queue: state.upload.queue.filter((t) => t.id !== taskId),
				},
			}));
		},
		// 重试任务
		retryTask: async (taskId: string, parentId: string | null) => {
			const { upload: up } = get();
			const task = up.queue.find((t) => t.id === taskId);
			if (!task) return;

			if (task.cosTaskId) {
				cancelCosTask(task.cosTaskId);
			}

			const { error: _error, ...taskWithoutError } = task;
			const taskForRetry: UploadTask = {
				...taskWithoutError,
				status: "pending" as UploadStatus,
				progress: 0,
				speed: 0,
			};
			set((state) => ({
				upload: {
					...state.upload,
					queue: state.upload.queue.map((t) =>
						t.id === taskId ? taskForRetry : t,
					),
				},
			}));
			await get().upload.startUpload(parentId, () => {});
		},
	},
	rename: {
		isOpen: false,
		fileName: { id: "", name: "" },
		loading: false,
		setFileName: (fn) =>
			set((state) => ({ rename: { ...state.rename, fileName: fn } })),
		open: (id, name) =>
			set((state) => ({
				rename: { ...state.rename, isOpen: true, fileName: { id, name } },
			})),
		close: () =>
			set((state) => ({
				rename: {
					...state.rename,
					isOpen: false,
					fileName: { id: "", name: "" },
				},
			})),
		submit: async (onSuccess) => {
			const { rename: rn } = get();
			if (!rn.fileName.name.trim()) return;

			set((state) => ({ rename: { ...state.rename, loading: true } }));
			try {
				await renameFile(rn.fileName.id, rn.fileName.name);
				message.success(
					formatMessage("renameSuccess", { name: rn.fileName.name }),
				);
				get().rename.close();
				onSuccess();
			} catch (error) {
				console.error("renameError:", error);
				message.error(formatMessage("renameError"));
			} finally {
				set((state) => ({ rename: { ...state.rename, loading: false } }));
			}
		},
	},
	delete: {
		isOpen: false,
		fileInfo: { id: "", name: "", isDir: false },
		multiple: { ids: [], names: [], isDirs: [] },
		loading: false,
		open: (id, name, isDir) =>
			set((state) => ({
				delete: {
					...state.delete,
					isOpen: true,
					fileInfo: { id, name, isDir },
				},
			})),
		openMultiple: (ids, names, isDirs) =>
			set((state) => ({
				delete: {
					...state.delete,
					isOpen: true,
					multiple: { ids, names, isDirs },
				},
			})),
		close: () =>
			set((state) => ({
				delete: {
					...state.delete,
					isOpen: false,
					fileInfo: { id: "", name: "", isDir: false },
					multiple: { ids: [], names: [], isDirs: [] },
				},
			})),
		submit: async (onSuccess) => {
			const { delete: dl } = get();
			set((state) => ({ delete: { ...state.delete, loading: true } }));
			try {
				const idsToDelete =
					dl.multiple.ids.length > 0 ? dl.multiple.ids : [dl.fileInfo.id];

				await Promise.all(idsToDelete.map((id) => deleteFile(id)));

				const count = idsToDelete.length;
				if (count === 1) {
					message.success(formatMessage("deleteSuccess"));
				} else {
					message.success(formatMessage("deleteSuccessMultiple", { count }));
				}

				get().delete.close();
				get().clearSelectedRowKeys();
				onSuccess();
			} catch (error) {
				console.error("deleteError:", error);
				message.error(formatMessage("deleteError"));
			} finally {
				set((state) => ({ delete: { ...state.delete, loading: false } }));
			}
		},
	},
}));
