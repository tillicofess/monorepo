import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Empty, Progress, Space, Typography } from 'antd';
import type React from 'react';
import type { UploadFile } from '../hooks/useFileUpload';

const { Text } = Typography;

interface UploadPanelProps {
  files: UploadFile[];
  uploading: boolean;
  onUpload: () => void;
  onCancel: () => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
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

export const UploadPanel: React.FC<UploadPanelProps> = ({
  files,
  uploading,
  onUpload,
  onCancel,
  onRemove,
  onRetry,
  onClear,
}) => {
  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button type="primary" onClick={onUpload} loading={uploading} disabled={pendingCount === 0}>
          开始上传
        </Button>
        {uploading && (
          <Button danger onClick={onCancel}>
            取消全部
          </Button>
        )}
        {files.length > 0 && !uploading && <Button onClick={onClear}>清空列表</Button>}
        <Text type="secondary">
          已完成 {completedCount}/{files.length}
        </Text>
      </Space>

      {files.length === 0 ? (
        <Empty
          image={<InboxOutlined style={{ fontSize: 48, color: '#ccc' }} />}
          description="请选择要上传的文件"
        />
      ) : (
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
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
                {file.status === 'uploading' && <Progress percent={file.progress} size="small" />}
              </div>

              <div style={{ width: '60px', textAlign: 'center' }}>{getStatusIcon(file.status)}</div>

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
    </div>
  );
};
