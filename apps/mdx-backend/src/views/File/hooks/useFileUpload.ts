import { message } from 'antd';
import { useRef, useState } from 'react';
import { calculateFileHash, checkFileExist, createChunks, uploadFileChunks } from '@/lib/file';

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

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (!pendingFiles.length) {
      message.warning('请先选择文件');
      return;
    }
    setUploading(true);
    setFiles((prev) =>
      prev.map((f) => (f.status === 'pending' ? { ...f, status: 'uploading' as UploadStatus } : f)),
    );
    for (const uploadFile of pendingFiles) {
      try {
        const chunks = createChunks(uploadFile.file);
        const fileHash = await calculateFileHash(chunks);
        const { shouldUpload, uploadedChunks } = await checkFileExist(
          fileHash,
          uploadFile.file.name,
        );
        if (!shouldUpload) {
          message.success(`${uploadFile.file.name} 秒传成功`);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'completed' as UploadStatus, progress: 100 }
                : f,
            ),
          );
          continue;
        }
        const uploadChunks = chunks.filter((_, index) => {
          const chunkHash = `${fileHash}-${index}`;
          return !uploadedChunks.includes(chunkHash);
        });
        await uploadFileChunks({
          fileHash,
          fileName: uploadFile.file.name,
          fileSize: uploadFile.file.size,
          parentId: currentFolderId,
          uploadChunks,
          abortControllers,
          setProgress: (p) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: p } : f)),
            );
          },
        });
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'completed' as UploadStatus, progress: 100 }
              : f,
          ),
        );
        message.success(`${uploadFile.file.name} 上传成功`);
      } catch (error: any) {
        if (error?.message === 'Upload aborted') {
          return;
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'failed' as UploadStatus, error: error?.message || '上传失败' }
              : f,
          ),
        );
        message.error(`${uploadFile.file.name} 上传失败: ${error}`);
      }
    }
    setUploading(false);
    onSuccess();
  };

  const abortUpload = () => {
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
    abortUpload,
    clearFiles,
  };
}
