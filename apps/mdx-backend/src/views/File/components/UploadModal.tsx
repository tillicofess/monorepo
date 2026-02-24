import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Empty, Modal, Progress, Space, Typography, theme } from 'antd';
import type React from 'react';
import type { UploadFile } from '../hooks/useFileUpload';

const { Text, Title } = Typography;
const { useToken } = theme;

interface UploadModalProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  files: UploadFile[];
  uploading: boolean;
  onUpload: () => void;
  onCancel: () => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'failed':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'uploading':
      return <LoadingOutlined />;
    case 'cancelled':
      return <CloseCircleOutlined style={{ color: '#faad14' }} />;
    default:
      return null;
  }
};

export const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onOpen,
  onClose,
  files,
  uploading,
  onUpload,
  onCancel,
  onRemove,
  onRetry,
  onClear,
  onFileSelect,
  fileInputRef,
}) => {
  const { token } = useToken();
  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={onOpen}>
        上传文件
      </Button>

      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            上传文件
          </Title>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          style={{ display: 'none' }}
        />

        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              选择文件
            </Button>
            <Button
              type="primary"
              onClick={onUpload}
              loading={uploading}
              disabled={pendingCount === 0}
            >
              开始上传
            </Button>
            {uploadingCount > 0 && (
              <Button danger onClick={onCancel}>
                取消上传
              </Button>
            )}
          </Space>
          <Text type="secondary">
            已完成 {completedCount}/{files.length}
          </Text>
        </Space>

        {files.length === 0 ? (
          <Empty
            image={<InboxOutlined style={{ fontSize: 48, color: token.colorTextQuaternary }} />}
            description={<Text type="secondary">点击上方"选择文件"按钮添加要上传的文件</Text>}
          />
        ) : (
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: `1px solid ${token.colorBorder}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text ellipsis style={{ display: 'block' }}>
                    {file.file.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatSize(file.file.size)}
                  </Text>
                </div>

                <div style={{ width: '120px', margin: '0 16px' }}>
                  {file.status === 'uploading' && (
                    <Progress
                      percent={file.progress}
                      size="small"
                      strokeColor={token.colorPrimary}
                    />
                  )}
                </div>

                <div style={{ width: '40px', textAlign: 'center' }}>
                  {getStatusIcon(file.status)}
                </div>

                <Space style={{ marginLeft: '8px' }}>
                  {file.status === 'failed' && (
                    <Button
                      type="text"
                      size="small"
                      icon={<SyncOutlined />}
                      onClick={() => onRetry(file.id)}
                    />
                  )}
                  {(file.status === 'pending' || file.status === 'failed') && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onRemove(file.id)}
                    />
                  )}
                </Space>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && !uploading && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={onClear}>清空列表</Button>
          </div>
        )}
      </Modal>
    </>
  );
};
