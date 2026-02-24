import { message } from 'antd';
import { useRef, useState } from 'react';
import {
  calculateFileHash,
  checkBatchFileExist,
  checkFileExist,
  createChunks,
  release,
  semaphore,
  uploadFileChunks,
} from '@/lib/file';

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

export interface UseFileUploadOptions {
  currentFolderId: string | null;
  onSuccess: () => void;
}

export function useFileUpload({ currentFolderId, onSuccess }: UseFileUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllers = useRef<AbortController[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'pending' as UploadStatus,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const updateFileProgress = (id: string, progress: number, status?: UploadStatus) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress, status: status || f.status } : f)),
    );
  };

  const uploadSingleFile = async (
    uploadFile: UploadFile,
    shouldUpload: boolean,
    controller: AbortController,
  ) => {
    const { file } = uploadFile;

    if (!shouldUpload) {
      updateFileProgress(uploadFile.id, 100, 'completed');
      return;
    }

    updateFileProgress(uploadFile.id, 0, 'uploading');

    try {
      await semaphore();

      const chunks = createChunks(file);
      const fileHash = await calculateFileHash(chunks);

      const { shouldUpload: needUpload, uploadedChunks } = await checkFileExist(
        fileHash,
        file.name,
      );

      if (!needUpload) {
        updateFileProgress(uploadFile.id, 100, 'completed');
        release();
        return;
      }

      const uploadChunks =
        uploadedChunks.length > 0
          ? chunks.filter((_, index) => !uploadedChunks.includes(index))
          : chunks;

      await uploadFileChunks({
        fileHash,
        fileName: file.name,
        fileSize: file.size,
        parentId: currentFolderId,
        uploadChunks,
        abortControllers: { current: [controller] },
        setProgress: (percent) => updateFileProgress(uploadFile.id, percent),
      });

      updateFileProgress(uploadFile.id, 100, 'completed');
    } catch (error: any) {
      if (error?.message === 'Upload aborted') {
        updateFileProgress(uploadFile.id, uploadFile.progress, 'cancelled');
      } else {
        updateFileProgress(uploadFile.id, uploadFile.progress, 'failed');
      }
    } finally {
      release();
    }
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (!pendingFiles.length) {
      message.warning('请先选择文件');
      return;
    }

    setUploading(true);

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
        return uploadSingleFile(f, checkResults[index].shouldUpload, controller);
      });

      await Promise.allSettled(uploadTasks);
    } catch (_error) {
      message.error('上传过程出错');
    } finally {
      setUploading(false);
      onSuccess();
    }
  };

  const cancelFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'cancelled' as UploadStatus } : f)),
    );
  };

  const retryFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'pending' as UploadStatus, progress: 0 } : f)),
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const cancelAll = () => {
    if (!abortControllers.current.length) {
      return;
    }
    abortControllers.current.forEach((controller) => {
      controller.abort();
    });
    abortControllers.current = [];
    setUploading(false);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'uploading' ? { ...f, status: 'cancelled' as UploadStatus } : f,
      ),
    );
    message.info('已取消上传');
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    fileInputRef,
    files,
    uploading,
    handleFileSelect,
    openFileDialog,
    handleUpload,
    cancelAll,
    cancelFile,
    retryFile,
    removeFile,
    clearFiles,
  };
}
