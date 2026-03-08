import { message } from 'antd';
import { create } from 'zustand';
import { createFolder, deleteFile, renameFile } from '@/apis/index';
import {
  calculateFileHash,
  checkFileExist,
  createChunks,
  mergeRequest,
  uploadFileChunks,
} from '@/lib/file';

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface UploadTask {
  id: string;
  file: File;
  fileHash?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  abortController: AbortController | null;
}

export interface UploadFile {
  id: string;
  file: File;
  fileHash?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface FileNameState {
  id: string;
  name: string;
}

interface DeleteFileState {
  id: string;
  name: string;
  isDir: boolean;
}

interface DeleteMultipleState {
  ids: string[];
  names: string[];
  isDirs: boolean[];
}

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
    startUpload: (parentId: string | null, onSuccess: () => void) => Promise<void>;
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
    name: '',
    loading: false,
    setName: (name) => set((state) => ({ createFolder: { ...state.createFolder, name } })),
    open: () => set((state) => ({ createFolder: { ...state.createFolder, isOpen: true } })),
    close: () =>
      set((state) => ({
        createFolder: { ...state.createFolder, isOpen: false, name: '' },
      })),
    submit: async (parentId, onSuccess) => {
      const { createFolder: cf } = get();
      if (!cf.name.trim()) return;

      set((state) => ({ createFolder: { ...state.createFolder, loading: true } }));
      try {
        const res = await createFolder(parentId, cf.name.trim());
        message.success(`文件夹 "${res.data.data.name}" 创建成功`);
        get().createFolder.close();
        onSuccess();
      } catch (error) {
        console.error('创建文件夹失败:', error);
        message.error('创建文件夹失败');
      } finally {
        set((state) => ({ createFolder: { ...state.createFolder, loading: false } }));
      }
    },
  },
  upload: {
    isModalOpen: false,
    queue: [],
    maxConcurrent: 3,
    fileInputRef: { current: null },
    openModal: () => set((state) => ({ upload: { ...state.upload, isModalOpen: true } })),
    closeModal: () => {
      const { upload: up } = get();
      up.queue.forEach((task) => {
        if (task.abortController) {
          task.abortController.abort();
        }
      });
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
        status: 'pending',
        abortController: null,
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
      const { upload: up } = get();
      const pendingTasks = up.queue.filter((t) => t.status === 'pending');

      if (pendingTasks.length === 0) {
        message.warning('没有待上传的文件');
        return;
      }

      /**
       * 单个任务执行
       */
      const runTask = async (task: UploadTask) => {
        const controller = new AbortController();

        // 🔒 先立刻占位，防止重复调度
        set((state) => ({
          upload: {
            ...state.upload,
            queue: state.upload.queue.map((t) =>
              t.id === task.id
                ? { ...t, status: 'uploading' as UploadStatus, abortController: controller }
                : t,
            ),
          },
        }));

        const updateProgress = (progress: number, status?: UploadStatus) => {
          set((state) => ({
            upload: {
              ...state.upload,
              queue: state.upload.queue.map((t) =>
                t.id === task.id ? { ...t, progress, status: status ?? t.status } : t,
              ),
            },
          }));
        };

        try {
          const file = task.file;
          updateProgress(0, 'uploading');

          const chunks = createChunks(file);
          const fileHash = await calculateFileHash(chunks);

          const { shouldUpload, uploadedChunks } = await checkFileExist(fileHash, file.name);

          // 秒传
          if (!shouldUpload) {
            updateProgress(100, 'completed');
            message.success(`${file.name} 文件已存在`);
            return;
          }

          // 已上传字节
          const uploadedBytes =
            uploadedChunks?.reduce((total: number, index: number) => {
              return total + (chunks[index]?.size ?? 0);
            }, 0) || 0;

          // 需要上传的分片
          const uploadChunks = chunks
            .map((chunk: Blob, index: number) => ({ chunk, index }))
            .filter(({ index }) => !uploadedChunks?.includes(index));

          const chunksWithSize = uploadChunks.map(({ chunk, index }) => ({
            fileHash,
            chunkHash: `${fileHash}-${index}`,
            chunk,
            size: chunk.size,
          }));

          await uploadFileChunks(
            chunksWithSize,
            (chunkUploaded: number) => {
              const uploadedSoFar = uploadedBytes + chunkUploaded;
              const progress = Math.floor((uploadedSoFar / file.size) * 100);
              updateProgress(progress);
            },
            controller.signal,
          );

          await mergeRequest(fileHash, file.name, file.size, parentId);

          updateProgress(100, 'completed');
        } catch (error) {
          if (error instanceof Error && error.message === 'Upload aborted') {
            return;
          }

          console.error('上传失败:', error);
          updateProgress(task.progress || 0, 'failed');
          message.error(`${task.file.name} 上传失败`);
        }
      };

      /**
       * 单次拉取一个任务执行
       */
      const scheduleNext = () => {
        const { upload: current } = get();

        const runningCount = current.queue.filter((t) => t.status === 'uploading').length;

        if (runningCount >= current.maxConcurrent) return;

        const nextTask = current.queue.find((t) => t.status === 'pending');
        if (!nextTask) {
          const stillUploading = current.queue.some((t) => t.status === 'uploading');
          if (!stillUploading) {
            onSuccess();
          }
          return;
        }

        runTask(nextTask).finally(() => {
          scheduleNext(); // 只触发一次
        });
      };

      /**
       * 初始化并发启动
       */
      const init = () => {
        const { upload: current } = get();
        const max = current.maxConcurrent;

        for (let i = 0; i < max; i++) {
          scheduleNext();
        }
      };

      init();
    },
    // 暂停任务
    pauseTask: (taskId: string) => {
      const task = get().upload.queue.find((t) => t.id === taskId);
      if (task?.abortController) {
        task.abortController.abort();
      }
      set((state) => ({
        upload: {
          ...state.upload,
          queue: state.upload.queue.map((t) =>
            t.id === taskId ? { ...t, status: 'paused' as UploadStatus, abortController: null } : t,
          ),
        },
      }));
    },
    // 继续任务
    resumeTask: async (taskId: string, parentId: string | null) => {
      set((state) => ({
        upload: {
          ...state.upload,
          queue: state.upload.queue.map((t) =>
            t.id === taskId ? { ...t, status: 'pending' as UploadStatus } : t,
          ),
        },
      }));
      await get().upload.startUpload(parentId, () => {});
    },
    // 取消任务
    cancelTask: (taskId: string) => {
      const task = get().upload.queue.find((t) => t.id === taskId);
      if (task?.abortController) {
        task.abortController.abort();
      }
      set((state) => ({
        upload: {
          ...state.upload,
          queue: state.upload.queue
            .map((t) => (t.id === taskId ? { ...t, abortController: null } : t))
            .filter((t) => t.id !== taskId),
        },
      }));
    },
    // 重试任务
    retryTask: async (taskId: string, parentId: string | null) => {
      const { upload: up } = get();
      const task = up.queue.find((t) => t.id === taskId);
      if (!task) return;

      const { error: _error, fileHash: _fileHash, ...taskWithoutError } = task;
      const taskForRetry = { ...taskWithoutError, status: 'pending' as UploadStatus, progress: 0 };
      delete (taskForRetry as Record<string, unknown>).fileHash;
      set((state) => ({
        upload: {
          ...state.upload,
          queue: state.upload.queue.map((t) =>
            t.id === taskId ? (taskForRetry as UploadTask) : t,
          ),
        },
      }));
      await get().upload.startUpload(parentId, () => {});
    },
  },
  rename: {
    isOpen: false,
    fileName: { id: '', name: '' },
    loading: false,
    setFileName: (fn) => set((state) => ({ rename: { ...state.rename, fileName: fn } })),
    open: (id, name) =>
      set((state) => ({ rename: { ...state.rename, isOpen: true, fileName: { id, name } } })),
    close: () =>
      set((state) => ({
        rename: { ...state.rename, isOpen: false, fileName: { id: '', name: '' } },
      })),
    submit: async (onSuccess) => {
      const { rename: rn } = get();
      if (!rn.fileName.name.trim()) return;

      set((state) => ({ rename: { ...state.rename, loading: true } }));
      try {
        await renameFile(rn.fileName.id, rn.fileName.name);
        message.success(`文件 "${rn.fileName.name}" 重命名成功`);
        get().rename.close();
        onSuccess();
      } catch (error) {
        console.error('重命名文件失败:', error);
        message.error('重命名文件失败');
      } finally {
        set((state) => ({ rename: { ...state.rename, loading: false } }));
      }
    },
  },
  delete: {
    isOpen: false,
    fileInfo: { id: '', name: '', isDir: false },
    multiple: { ids: [], names: [], isDirs: [] },
    loading: false,
    open: (id, name, isDir) =>
      set((state) => ({
        delete: { ...state.delete, isOpen: true, fileInfo: { id, name, isDir } },
      })),
    openMultiple: (ids, names, isDirs) =>
      set((state) => ({
        delete: { ...state.delete, isOpen: true, multiple: { ids, names, isDirs } },
      })),
    close: () =>
      set((state) => ({
        delete: {
          ...state.delete,
          isOpen: false,
          fileInfo: { id: '', name: '', isDir: false },
          multiple: { ids: [], names: [], isDirs: [] },
        },
      })),
    submit: async (onSuccess) => {
      const { delete: dl } = get();
      set((state) => ({ delete: { ...state.delete, loading: true } }));
      try {
        const idsToDelete = dl.multiple.ids.length > 0 ? dl.multiple.ids : [dl.fileInfo.id];

        await Promise.all(idsToDelete.map((id) => deleteFile(id)));

        const count = idsToDelete.length;
        if (count === 1) {
          message.success(`删除成功`);
        } else {
          message.success(`成功删除 ${count} 个项目`);
        }

        get().delete.close();
        get().clearSelectedRowKeys();
        onSuccess();
      } catch (error) {
        console.error('删除文件失败:', error);
        message.error('删除文件失败');
      } finally {
        set((state) => ({ delete: { ...state.delete, loading: false } }));
      }
    },
  },
}));
