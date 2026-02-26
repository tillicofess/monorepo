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

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled' | 'paused';

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
    currentFile: UploadFile | null;
    uploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    abortController: AbortController | null;
    openModal: () => void;
    closeModal: () => void;
    selectFile: (file: File) => void;
    uploadFile: (parentId: string | null, onSuccess: () => void) => Promise<void>;
    pauseUpload: () => void;
    cancelUpload: () => void;
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
    currentFile: null,
    uploading: false,
    fileInputRef: { current: null },
    abortController: null,
    openModal: () => set((state) => ({ upload: { ...state.upload, isModalOpen: true } })),
    closeModal: () => {
      const { upload: up } = get();
      if (up.abortController) {
        up.abortController.abort();
      }
      set((state) => ({
        upload: {
          ...state.upload,
          isModalOpen: false,
          currentFile: null,
          uploading: false,
          fileInputRef: { current: null },
          abortController: null,
        },
      }));
    },
    selectFile: (file: File) => {
      const newFile: UploadFile = {
        id: generateId(),
        file,
        progress: 0,
        status: 'pending',
      };
      set((state) => ({
        upload: { ...state.upload, currentFile: newFile },
      }));
    },
    uploadFile: async (parentId: string | null, onSuccess: () => void) => {
      const { upload: up } = get();
      if (!up.currentFile) {
        message.warning('请先选择文件');
        return;
      }

      // 创建 AbortController
      const controller = new AbortController();
      set((state) => ({
        upload: { ...state.upload, uploading: true, abortController: controller },
      }));

      const file = up.currentFile;

      // 更新状态和进度工具函数
      const updateProgress = (progress: number, status?: UploadStatus) => {
        set((state) => ({
          upload: {
            ...state.upload,
            currentFile: state.upload.currentFile
              ? {
                ...state.upload.currentFile,
                progress,
                status: status || state.upload.currentFile.status,
              }
              : null,
          },
        }));
      };

      try {
        updateProgress(file.progress || 0, 'uploading');

        //  生成原始分片
        const chunks = createChunks(file.file);

        //  计算 hash
        const fileHash = await calculateFileHash(chunks);

        //  秒传检测
        const { shouldUpload, uploadedChunks } = await checkFileExist(
          fileHash,
          file.file.name,
        );

        if (!shouldUpload) {
          updateProgress(100, 'completed');
          message.success('文件已存在');
          set((state) => ({
            upload: { ...state.upload, uploading: false, abortController: null },
          }));
          onSuccess();
          return;
        }

        // 已上传的分片数
        const uploadedBytes =
          uploadedChunks?.reduce((total: number, index: number) => {
            return total + (chunks[index]?.size ?? 0);
          }, 0) || 0;

        //  保留真实 index
        const uploadChunks = chunks
          .map((chunk, index) => ({
            chunk,
            index,
          }))
          .filter(({ index }) => !uploadedChunks?.includes(index));

        const chunksWithSize = uploadChunks.map(({ chunk, index }) => ({
          fileHash,
          chunkHash: `${fileHash}-${index}`, // ⭐ 真实 index
          chunk,
          size: chunk.size,
        }));

        console.log('开始上传', chunksWithSize);

        // 上传分片
        await uploadFileChunks(
          chunksWithSize,
          (chunkUploaded: number) => {
            const uploadedSoFar = uploadedBytes + chunkUploaded;

            const progress = Math.floor(
              (uploadedSoFar / file.file.size) * 100,
            );

            updateProgress(progress);
          },
          controller.signal,
        );

        // 合并文件
        await mergeRequest(
          fileHash,
          file.file.name,
          file.file.size,
          parentId,
        );

        updateProgress(100, 'completed');

        set((state) => ({
          upload: { ...state.upload, uploading: false, abortController: null },
        }));

        message.success('上传成功');
        onSuccess();
      } catch (error) {
        const current = get().upload.currentFile;

        if (error instanceof Error && error.message === 'Upload aborted') {
          if (current?.status === 'paused') {
            message.info('已暂停上传');
          } else if (current?.status === 'cancelled') {
            set((state) => ({
              upload: {
                ...state.upload,
                currentFile: null,
                uploading: false,
                abortController: null,
              },
            }));
            message.info('已取消上传');
          }

          return;
        }

        console.error('上传失败:', error);

        updateProgress(current?.progress || 0, 'failed');

        set((state) => ({
          upload: { ...state.upload, uploading: false, abortController: null },
        }));

        message.error('上传失败');
      }
    },
    pauseUpload: () => {
      const { upload: up } = get();

      if (up.abortController) {
        up.abortController.abort();
      }

      set((state) => ({
        upload: {
          ...state.upload,
          currentFile: state.upload.currentFile
            ? {
              ...state.upload.currentFile,
              status: 'paused',
            }
            : null,
        },
      }));
    },
    cancelUpload: () => {
      const { upload: up } = get();

      if (up.abortController) {
        up.abortController.abort();
      }

      set((state) => ({
        upload: {
          ...state.upload,
          currentFile: state.upload.currentFile
            ? {
              ...state.upload.currentFile,
              status: 'cancelled',
            }
            : null,
        },
      }));
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
