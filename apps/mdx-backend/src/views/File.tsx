import { FileOutlined, FolderOpenOutlined, HolderOutlined, InboxOutlined } from '@ant-design/icons';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { TableColumnsType } from 'antd';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  message,
  Progress,
  Space,
  Table,
  Typography,
  theme,
} from 'antd';
import { FileUp, FolderPlus, Upload, X } from 'lucide-react';
import type React from 'react';
import { useContext, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useSWR from 'swr';
import {
  createFolder,
  deleteFile,
  downloadFile,
  getFileList,
  moveFileOrFolder,
  renameFile,
} from '@/apis/index';
import DraggableRow from '@/components/DraggableRow';
import { RowContext } from '@/components/DraggableRow.tsx';
import { TableFolderDroppable } from '@/components/DroppableNode.tsx';
import EllipsisBreadcrumb from '@/components/EllipsisBreadcrumb.tsx';
import { calculateFileHash, checkFileExist, createChunks, uploadFileChunks } from '@/lib/file';
import { useAbility } from '@/providers/AbilityProvider';
import { formatFileSize } from '@/utils/utils';

const { useToken } = theme;

interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadTime: string;
  isDir: boolean;
}

interface BreadcrumbItem {
  id: string | null;
  name: React.ReactNode;
}

const DragHandle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <span
      ref={setActivatorNodeRef}
      {...listeners}
      style={{ cursor: 'grab', display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
    </span>
  );
};

const File: React.FC = () => {
  const { token } = useToken();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllers = useRef<AbortController[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState({
    id: '',
    name: '',
  });
  const [renaming, setRenaming] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState({
    id: '',
    name: '',
    isDir: false,
  });
  const [deleting, setDeleting] = useState(false);
  const ability = useAbility();
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

  const handleDragStart = (event: any) => {
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

    message.success('移动成功');
    refreshFileList();

    setActiveItem(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProgress(0);
    }
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
        return;
      }
      const uploadChunks = chunks.filter((_, index) => {
        const chunkHash = `${fileHash}-${index}`;
        return !uploadedChunks.includes(chunkHash);
      });
      await uploadFileChunks(
        fileHash,
        selectedFile.name,
        selectedFile.size,
        currentFolderId as string | null,
        uploadChunks,
        abortControllers,
        setProgress,
      );
      setSelectedFile(null);
      setProgress(0);
      message.success('文件上传成功');
    } catch (error) {
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

  const handleEnterFolder = (record: FileItem) => {
    if (record.isDir) {
      setCurrentPath([...currentPath, { id: record.id, name: record.name }]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

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
      setNewFileName({
        id: '',
        name: '',
      });
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
      setDeleteFileId({
        id: '',
        name: '',
        isDir: false,
      });
      refreshFileList();
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    } finally {
      setDeleting(false);
    }
  };

  const columns: TableColumnsType<FileItem> = [
    {
      title: <FormattedMessage id="fileName" defaultMessage="File Name" />,
      dataIndex: 'name',
      key: 'name',
      minWidth: 240,
      ellipsis: true,
      render: (text: string, record: FileItem) => {
        const isDir = record.isDir;

        const content = (
          <Space>
            <DragHandle>
              <HolderOutlined />
            </DragHandle>

            {isDir ? <FolderOpenOutlined style={{ color: '#6366F1' }} /> : <FileOutlined />}

            {isDir ? (
              <Button
                type="link"
                onClick={() => handleEnterFolder(record)}
                style={{ color: 'inherit', cursor: 'pointer' }}
              >
                {text}
              </Button>
            ) : (
              text
            )}
          </Space>
        );

        return isDir ? (
          <TableFolderDroppable folder={record}>{content}</TableFolderDroppable>
        ) : (
          content
        );
      },
      filters: [
        { text: 'Folders', value: 1 },
        { text: 'Files', value: 0 },
      ],
      onFilter: (value, record) => record.isDir === value,
    },
    {
      title: <FormattedMessage id="fileSize" defaultMessage="File Size" />,
      dataIndex: 'size',
      key: 'size',
      width: 180,
      render: (size: number, record: FileItem) => (record.isDir ? '-' : formatFileSize(size)),
      sorter: (a: FileItem, b: FileItem) => a.size - b.size,
    },
    {
      title: <FormattedMessage id="uploadDate" defaultMessage="Upload Date" />,
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
      render: (uploadTime: string) => {
        return new Date(uploadTime).toLocaleString();
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 240,
      align: 'center',
      render: (record: FileItem) => (
        <Space size="middle">
          <Button
            type="text"
            size="small"
            onClick={() => {
              setNewFileName({
                id: record.id,
                name: record.name,
              });
              setIsRenameModalOpen(true);
            }}
          >
            重命名
          </Button>
          <Button
            type="text"
            size="small"
            danger
            onClick={() => {
              setDeleteFileId({
                id: record.id,
                name: record.name,
                isDir: record.isDir,
              });
              setIsDeleteModalOpen(true);
            }}
          >
            删除
          </Button>
          {!record.isDir && (
            <Button type="link" size="small" onClick={() => downloadFile(record.id)}>
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FolderOpenOutlined style={{ color: '#6366F1' }} />
          <FormattedMessage id="fileManagement" />
        </Typography.Title>
        <Space wrap>
          <Button
            icon={<FolderPlus size={16} />}
            onClick={() => setIsCreateFolderModalOpen(true)}
            disabled={uploading}
          >
            新建文件夹
          </Button>
          <Button
            type="primary"
            icon={<FileUp size={16} />}
            onClick={openFileDialog}
            disabled={uploading}
          >
            选择文件
          </Button>
          <Button
            type="primary"
            icon={<Upload size={16} />}
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile || uploading || !ability.can('upload', 'largeFile')}
          >
            上传文件
          </Button>
          <Button
            icon={<X size={16} />}
            onClick={abortUpload}
            disabled={!uploading}
            danger={uploading}
          >
            取消上传
          </Button>
        </Space>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {selectedFile && (
        <div
          style={{
            marginBottom: '8px',
            padding: '12px 16px',
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 8,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong>
            <FormattedMessage id="selectedFile" defaultMessage="已选文件" />:
          </Typography.Text>
          <Typography.Text style={{ marginLeft: 8 }}>{selectedFile.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
            ({formatFileSize(selectedFile.size)})
          </Typography.Text>
        </div>
      )}

      {uploading && (
        <div style={{ marginBottom: '8px' }}>
          <Progress percent={progress} status="active" strokeColor="#6366F1" />
          <Typography.Text
            type="secondary"
            style={{ display: 'block', marginTop: 4, fontSize: 12 }}
          >
            <FormattedMessage id="uploading" defaultMessage="上传中，请稍候..." />
          </Typography.Text>
        </div>
      )}

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

            <Table
              size="middle"
              scroll={{ y: 640 }}
              rowKey={(record) => record.id}
              columns={columns}
              loading={isLoading}
              dataSource={fileList as FileItem[]}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical" align="center">
                        <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <span style={{ color: '#8c8c8c' }}>此文件夹为空</span>
                      </Space>
                    }
                  />
                ),
              }}
              onRow={(record) => {
                return {
                  onDoubleClick: () => handleEnterFolder(record),
                  style: { cursor: record.isDir ? 'pointer' : 'default' },
                };
              }}
              components={{
                body: {
                  row: DraggableRow,
                },
              }}
            />
          </Space>

          <DragOverlay dropAnimation={null}>
            {activeItem && (
              <div
                style={{
                  width: 180,
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.95,
                  cursor: 'grabbing',
                }}
              >
                {activeItem.isDir ? (
                  <FolderOpenOutlined style={{ color: '#6366F1' }} />
                ) : (
                  <FileOutlined />
                )}
                <span
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                >
                  {activeItem.name}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </Card>

      <Modal
        title="新建文件夹"
        open={isCreateFolderModalOpen}
        onOk={handleCreateFolderSubmit}
        confirmLoading={creatingFolder}
        okButtonProps={{
          disabled: !newFolderName.trim(),
        }}
        onCancel={() => {
          setIsCreateFolderModalOpen(false);
          setNewFolderName('');
        }}
        destroyOnHidden
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          maxLength={100}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolderSubmit}
          autoFocus
        />
      </Modal>

      <Modal
        title="重命名"
        open={isRenameModalOpen}
        onOk={handleRenameSubmit}
        confirmLoading={renaming}
        okButtonProps={{
          disabled: !newFileName.name.trim(),
        }}
        onCancel={() => {
          setIsRenameModalOpen(false);
          setNewFileName({
            id: '',
            name: '',
          });
        }}
        destroyOnHidden
      >
        <Input
          value={newFileName.name}
          maxLength={100}
          onChange={(e) =>
            setNewFileName({
              id: newFileName.id,
              name: e.target.value,
            })
          }
          onPressEnter={handleRenameSubmit}
          autoFocus
        />
      </Modal>

      <Modal
        title="删除"
        open={isDeleteModalOpen}
        onOk={handleDeleteSubmit}
        confirmLoading={deleting}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteFileId({
            id: '',
            name: '',
            isDir: false,
          });
        }}
        destroyOnHidden
        okButtonProps={{ danger: true }}
      >
        <Typography.Text>
          {deleteFileId.isDir ? '确认删除文件夹' : '确认删除文件'} "{deleteFileId.name}"
          吗？此操作不可恢复。
        </Typography.Text>
      </Modal>
    </div>
  );
};

export default File;
