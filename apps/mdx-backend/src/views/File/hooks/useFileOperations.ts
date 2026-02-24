import { message } from 'antd';
import { useState } from 'react';
import { createFolder, deleteFile, renameFile } from '@/apis/index';
import type { DeleteFileState, FileNameState } from '../types';

export interface UseFileOperationsOptions {
  currentFolderId: string | null;
  refreshFileList: () => void;
}

export function useFileOperations({ currentFolderId, refreshFileList }: UseFileOperationsOptions) {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState<FileNameState>({ id: '', name: '' });
  const [renaming, setRenaming] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<DeleteFileState>({
    id: '',
    name: '',
    isDir: false,
  });
  const [deleting, setDeleting] = useState(false);

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) {
      return;
    }

    setCreatingFolder(true);
    try {
      const responseData = await createFolder(currentFolderId, newFolderName.trim());
      message.success(`文件夹 "${responseData.data.data.name}" 创建成功`);
      setIsCreateFolderModalOpen(false);
      setNewFolderName('');
      refreshFileList();
    } catch (error) {
      console.error('创建文件夹失败:', error);
      message.error('创建文件夹失败');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (!newFileName.name.trim()) {
      return;
    }
    setRenaming(true);
    try {
      await renameFile(newFileName.id, newFileName.name);
      message.success(`文件 "${newFileName.name}" 重命名成功`);
      setIsRenameModalOpen(false);
      setNewFileName({ id: '', name: '' });
      refreshFileList();
    } catch (error) {
      console.error('重命名文件失败:', error);
      message.error('重命名文件失败');
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setDeleting(true);
    try {
      await deleteFile(deleteFileId.id);
      deleteFileId.isDir
        ? message.success(`文件夹 "${deleteFileId.name}" 删除成功`)
        : message.success(`文件 "${deleteFileId.name}" 删除成功`);
      setIsDeleteModalOpen(false);
      setDeleteFileId({ id: '', name: '', isDir: false });
      refreshFileList();
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    } finally {
      setDeleting(false);
    }
  };

  const openCreateFolderModal = () => setIsCreateFolderModalOpen(true);
  const closeCreateFolderModal = () => {
    setIsCreateFolderModalOpen(false);
    setNewFolderName('');
  };

  const openRenameModal = (id: string, name: string) => {
    setNewFileName({ id, name });
    setIsRenameModalOpen(true);
  };
  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    setNewFileName({ id: '', name: '' });
  };

  const openDeleteModal = (id: string, name: string, isDir: boolean) => {
    setDeleteFileId({ id, name, isDir });
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteFileId({ id: '', name: '', isDir: false });
  };

  return {
    createFolder: {
      isOpen: isCreateFolderModalOpen,
      name: newFolderName,
      loading: creatingFolder,
      setName: setNewFolderName,
      open: openCreateFolderModal,
      close: closeCreateFolderModal,
      submit: handleCreateFolderSubmit,
    },
    rename: {
      isOpen: isRenameModalOpen,
      fileName: newFileName,
      loading: renaming,
      setFileName: setNewFileName,
      open: openRenameModal,
      close: closeRenameModal,
      submit: handleRenameSubmit,
    },
    delete: {
      isOpen: isDeleteModalOpen,
      fileInfo: deleteFileId,
      loading: deleting,
      open: openDeleteModal,
      close: closeDeleteModal,
      submit: handleDeleteSubmit,
    },
  };
}
