import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Modal, Progress, Space, Typography, theme } from 'antd';
import { useFileStore } from '../store/useFileStore';

interface UploadModalProps {
  parentId: string | null;
  onSuccess: () => void;
}

const { Text, Title } = Typography;
const { useToken } = theme;

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

export const UploadModal = ({ parentId, onSuccess }: UploadModalProps) => {
  const { token } = useToken();
  const upload = useFileStore((state) => state.upload);

  const pendingCount = upload.files.filter((f) => f.status === 'pending').length;
  const completedCount = upload.files.filter((f) => f.status === 'completed').length;
  const uploadingCount = upload.files.filter((f) => f.status === 'uploading').length;

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          上传文件
        </Title>
      }
      open={upload.isModalOpen}
      onCancel={upload.closeModal}
      footer={null}
      width={600}
    >
      <input
        type="file"
        ref={upload.fileInputRef as React.RefObject<HTMLInputElement>}
        onChange={upload.handleFilesSelect}
        multiple
        style={{ display: 'none' }}
      />

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button
            onClick={() =>
              (upload.fileInputRef as React.RefObject<HTMLInputElement>).current?.click()
            }
            disabled={upload.uploading}
          >
            选择文件
          </Button>
          <Button
            type="primary"
            onClick={() => upload.uploadAll(parentId, onSuccess)}
            loading={upload.uploading}
            disabled={pendingCount === 0}
          >
            开始上传
          </Button>
          {uploadingCount > 0 && (
            <Button danger onClick={upload.cancelAll}>
              取消上传
            </Button>
          )}
        </Space>
        <Text type="secondary">
          已完成 {completedCount}/{upload.files.length}
        </Text>
      </Space>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {upload.files.map((file) => (
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
                <Progress percent={file.progress} size="small" strokeColor={token.colorPrimary} />
              )}
            </div>

            <div style={{ width: '40px', textAlign: 'center' }}>{getStatusIcon(file.status)}</div>

            <Space style={{ marginLeft: '8px' }}>
              {file.status === 'failed' && (
                <Button
                  type="text"
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => upload.retryFile(file.id)}
                />
              )}
              {(file.status === 'pending' || file.status === 'failed') && (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => upload.removeFile(file.id)}
                />
              )}
            </Space>
          </div>
        ))}
      </div>

      {upload.files.length > 0 && !upload.uploading && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={upload.clearAllFiles}>清空列表</Button>
        </div>
      )}
    </Modal>
  );
};
