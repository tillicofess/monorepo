import { message } from 'antd';
import { create } from 'zustand';
import { createFolder, deleteFile, renameFile } from '@/apis/index';
import {
  calculateFileHash,
  checkBatchFileExist,
  checkFileExist,
  createChunks,
  release,
  semaphore,
  uploadFileChunks,
} from '@/lib/file';
import { generateId } from '@/utils/utils';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';

export interface UploadFile {
  id: string;
  file: File;
  fileHash?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadedChunks?: number[];
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
    files: UploadFile[];
    uploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    openModal: () => void;
    closeModal: () => void;
    handleFilesSelect: (e: File[]) => void;
    uploadAll: (parentId: string | null, onSuccess: () => void) => Promise<void>;
    cancelAll: () => void;
    retryFile: (id: string) => void;
    removeFile: (id: string) => void;
    clearAllFiles: () => void;
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

const abortControllers: { current: AbortController[] } = { current: [] };

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
    files: [],
    uploading: false,
    fileInputRef: { current: null },
    openModal: () => set((state) => ({ upload: { ...state.upload, isModalOpen: true } })),
    closeModal: () =>
      set((state) => ({
        upload: { ...state.upload, isModalOpen: false, files: [], uploading: false },
      })),
    handleFilesSelect: (files: File[]) => {
      const newFiles = files.map((file) => ({
        id: generateId(),
        file,
        progress: 0,
        status: 'pending' as UploadStatus,
      }));

      set((state) => ({
        upload: { ...state.upload, files: [...state.upload.files, ...newFiles] },
      }));
    },
    uploadAll: async (parentId, onSuccess) => {
      const { upload: up } = get();
      const pendingFiles = up.files.filter((f) => f.status === 'pending');
      if (!pendingFiles.length) {
        message.warning('请先选择文件');
        return;
      }

      set((state) => ({ upload: { ...state.upload, uploading: true } }));

      const updateProgress = (id: string, progress: number, status?: UploadStatus) => {
        set((state) => ({
          upload: {
            ...state.upload,
            files: state.upload.files.map((f) =>
              f.id === id ? { ...f, progress, status: status || f.status } : f,
            ),
          },
        }));
      };

      try {
        const fileInfos = await Promise.all(
          pendingFiles.map(async (f) => {
            const chunks = createChunks(f.file);
            const fileHash = await calculateFileHash(chunks);
            return { ...f, fileHash };
          }),
        );

        const filesWithHash = fileInfos.filter(
          (f): f is UploadFile & { fileHash: string } => !!f.fileHash,
        );

        const checkResults = await checkBatchFileExist(
          filesWithHash.map((f) => ({ fileHash: f.fileHash, fileName: f.file.name })),
        );

        const uploadTasks = filesWithHash.map((f, index) => {
          const controller = new AbortController();
          abortControllers.current.push(controller);

          const shouldUpload = checkResults[index].shouldUpload;

          return (async () => {
            if (!shouldUpload) {
              updateProgress(f.id, 100, 'completed');
              return;
            }

            updateProgress(f.id, 0, 'uploading');

            try {
              await semaphore();

              const chunks = createChunks(f.file);
              const fileHash = await calculateFileHash(chunks);

              const { shouldUpload: needUpload, uploadedChunks } = await checkFileExist(
                fileHash,
                f.file.name,
              );

              if (!needUpload) {
                updateProgress(f.id, 100, 'completed');
                release();
                return;
              }

              const uploadChunks =
                uploadedChunks && uploadedChunks.length > 0
                  ? chunks.filter((_, index) => !uploadedChunks.includes(index))
                  : chunks;

              await uploadFileChunks({
                fileHash,
                fileName: f.file.name,
                fileSize: f.file.size,
                parentId,
                uploadChunks,
                abortControllers,
                setProgress: (percent) => updateProgress(f.id, percent),
              });

              updateProgress(f.id, 100, 'completed');
            } catch (error: unknown) {
              if (error instanceof Error && error.message === 'Upload aborted') {
                updateProgress(f.id, f.progress, 'cancelled');
              } else {
                updateProgress(f.id, f.progress, 'failed');
              }
            } finally {
              release();
            }
          })();
        });

        await Promise.allSettled(uploadTasks);
      } catch {
        message.error('上传过程出错');
      } finally {
        abortControllers.current = [];
        set((state) => ({ upload: { ...state.upload, uploading: false } }));
        onSuccess();
      }
    },
    cancelAll: () => {
      if (!abortControllers.current.length) return;
      abortControllers.current.forEach((controller) => {
        controller.abort();
      });
      abortControllers.current = [];
      set((state) => ({
        upload: {
          ...state.upload,
          uploading: false,
          files: state.upload.files.map((f) =>
            f.status === 'uploading' ? { ...f, status: 'cancelled' as UploadStatus } : f,
          ),
        },
      }));
      message.info('已取消上传');
    },
    retryFile: (id) =>
      set((state) => ({
        upload: {
          ...state.upload,
          files: state.upload.files.map((f) =>
            f.id === id ? { ...f, status: 'pending' as UploadStatus, progress: 0 } : f,
          ),
        },
      })),
    removeFile: (id) =>
      set((state) => ({
        upload: { ...state.upload, files: state.upload.files.filter((f) => f.id !== id) },
      })),
    clearAllFiles: () => set((state) => ({ upload: { ...state.upload, files: [] } })),
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
