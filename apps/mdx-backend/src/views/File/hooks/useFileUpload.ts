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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProgress(0);
    }
    // 清空 input value，允许重复选择同一文件
    e.target.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.warning('请先选择文件');
      return;
    }
    setUploading(true);
    try {
      const chunks = createChunks(selectedFile);
      const fileHash = await calculateFileHash(chunks);
      const { shouldUpload, uploadedChunks } = await checkFileExist(fileHash, selectedFile.name);
      if (!shouldUpload) {
        message.success('文件已存在，秒传成功');
        setSelectedFile(null);
        setProgress(0);
        onSuccess();
        return;
      }
      const uploadChunks = chunks.filter((_, index) => {
        const chunkHash = `${fileHash}-${index}`;
        return !uploadedChunks.includes(chunkHash);
      });
      await uploadFileChunks({
        fileHash,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        parentId: currentFolderId,
        uploadChunks,
        abortControllers,
        setProgress,
      });
      setSelectedFile(null);
      setProgress(0);
      message.success('文件上传成功');
      onSuccess();
    } catch (error: any) {
      if (error?.message === 'Upload aborted') {
        // 主动取消上传，不显示错误提示
        return;
      }
      message.error(`文件上传失败: ${error}`);
    } finally {
      setUploading(false);
    }
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
    setProgress(0);
    message.info('已取消上传');
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setProgress(0);
  };

  return {
    fileInputRef,
    selectedFile,
    progress,
    uploading,
    handleFileSelect,
    openFileDialog,
    handleUpload,
    abortUpload,
    clearSelectedFile,
  };
}
