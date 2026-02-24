import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card, Space, theme } from 'antd';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useSWR from 'swr';
import { getFileList, moveFileOrFolder } from '@/apis/index';
import EllipsisBreadcrumb from '@/components/EllipsisBreadcrumb.tsx';
import { CreateFolderModal } from './components/CreateFolderModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DragOverlayContent } from './components/DragOverlayContent';
import { FileTable } from './components/FileTable';
import { FileToolbar } from './components/FileToolbar';
import { FileUploadPanel } from './components/FileUploadPanel';
import { RenameModal } from './components/RenameModal';
import { useFileOperations } from './hooks/useFileOperations';
import { useFileUpload } from './hooks/useFileUpload';
import type { BreadcrumbItem, FileItem } from './types';

const { useToken } = theme;

const File: React.FC = () => {
  const { token } = useToken();
  const pointerSensor = useSensor(PointerSensor);
  const sensors = useSensors(pointerSensor);

  const [activeItem, setActiveItem] = useState<FileItem | null>(null);

  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([
    { id: null, name: <FormattedMessage id="file.root" defaultMessage="Root Directory" /> },
  ]);

  const currentFolderId = currentPath[currentPath.length - 1]?.id ?? null;

  const {
    data: fileList,
    isLoading,
    mutate: refreshFileList,
  } = useSWR(['/file/list', currentFolderId], async ([_, parentId]) => {
    const res = await getFileList(parentId as string | null);
    return res.data.data;
  });

  const {
    fileInputRef,
    selectedFile,
    progress,
    uploading,
    handleFileSelect,
    openFileDialog,
    handleUpload,
    abortUpload,
  } = useFileUpload({
    currentFolderId,
    onSuccess: refreshFileList,
  });

  const {
    createFolder,
    rename,
    delete: deleteOp,
  } = useFileOperations({
    currentFolderId,
    refreshFileList,
  });

  const handleDragStart = (event: { active: { id: unknown } }) => {
    const { active } = event;
    const item = fileList?.find((file: FileItem) => file.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const draggedId = active.id;
    const overId = over.id;

    if (
      typeof overId !== 'string' ||
      !overId.startsWith('folder-') ||
      overId.replace('folder-', '') === draggedId
    ) {
      setActiveItem(null);
      return;
    }

    const newParentId = overId.replace('folder-', '');

    await moveFileOrFolder(draggedId as string, newParentId);
    refreshFileList();
    setActiveItem(null);
  };

  const handleEnterFolder = (record: FileItem) => {
    if (record.isDir) {
      setCurrentPath([...currentPath, { id: record.id, name: record.name }]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FileToolbar
        uploading={uploading}
        selectedFile={selectedFile}
        onCreateFolder={createFolder.open}
        onOpenFileDialog={openFileDialog}
        onUpload={handleUpload}
        onAbort={abortUpload}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 上传面板 */}
      <FileUploadPanel selectedFile={selectedFile} progress={progress} uploading={uploading} />

      {/* FileTable */}
      <Card
        style={{
          borderRadius: 12,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={pointerWithin}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <EllipsisBreadcrumb
              items={currentPath}
              onItemClick={handleBreadcrumbClick}
              maxDisplayCount={3}
            />

            <FileTable
              fileList={fileList}
              isLoading={isLoading}
              onEnterFolder={handleEnterFolder}
              onRename={rename.open}
              onDelete={deleteOp.open}
            />
          </Space>

          <DragOverlay dropAnimation={null}>
            <DragOverlayContent activeItem={activeItem} />
          </DragOverlay>
        </DndContext>
      </Card>

      <CreateFolderModal
        open={createFolder.isOpen}
        folderName={createFolder.name}
        loading={createFolder.loading}
        onNameChange={createFolder.setName}
        onSubmit={createFolder.submit}
        onCancel={createFolder.close}
      />

      <RenameModal
        open={rename.isOpen}
        fileName={rename.fileName}
        loading={rename.loading}
        onNameChange={rename.setFileName}
        onSubmit={rename.submit}
        onCancel={rename.close}
      />

      <DeleteConfirmModal
        open={deleteOp.isOpen}
        fileInfo={deleteOp.fileInfo}
        loading={deleteOp.loading}
        onSubmit={deleteOp.submit}
        onCancel={deleteOp.close}
      />
    </div>
  );
};

export default File;
