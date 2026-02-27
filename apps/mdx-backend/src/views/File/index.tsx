import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FileSyncOutlined } from '@ant-design/icons';
import { Card, Space, theme, Typography } from 'antd';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useSWR from 'swr';
import { getFileList, moveFileOrFolder } from '@/apis/index';
import EllipsisBreadcrumb from '@/components/EllipsisBreadcrumb.tsx';
import { CreateFolderModal } from './components/CreateFolderModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DragOverlayContent } from './components/DragOverlayContent';
import { FileActions } from './components/FileActions';
import { FileTable } from './components/FileTable';
import { RenameModal } from './components/RenameModal';
import { UploadModal } from './components/UploadModal';
import { useFileStore } from './store/useFileStore';
import type { BreadcrumbItem, FileItem } from './types';

const { Title } = Typography;
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        gap: 16,
      }}
    >
      <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileSyncOutlined style={{ color: '#1990FF' }} />
        <FormattedMessage id="dashboard.overview" defaultMessage="文件管理" />
      </Title>
      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: 'none',
          background: token.colorBgContainer,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={pointerWithin}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <EllipsisBreadcrumb
              items={currentPath}
              onItemClick={handleBreadcrumbClick}
              maxDisplayCount={3}
            />

            <FileActions />

            <FileTable
              fileList={fileList}
              isLoading={isLoading}
              onEnterFolder={handleEnterFolder}
              onRename={(id, name) => useFileStore.getState().rename.open(id, name)}
              onDelete={(id, name, isDir) => useFileStore.getState().delete.open(id, name, isDir)}
            />
          </Space>

          <DragOverlay dropAnimation={null}>
            <DragOverlayContent activeItem={activeItem} />
          </DragOverlay>
        </DndContext>
      </Card>

      <UploadModal parentId={currentFolderId} onSuccess={refreshFileList} />
      <CreateFolderModal parentId={currentFolderId} onSuccess={refreshFileList} />
      <RenameModal onSuccess={refreshFileList} />
      <DeleteConfirmModal onSuccess={refreshFileList} />
    </div>
  );
};

export default File;