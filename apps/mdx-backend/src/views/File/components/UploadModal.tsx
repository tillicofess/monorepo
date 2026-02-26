import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  FileOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Modal, Progress, Space, Typography, theme } from 'antd';
import { useState } from 'react';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#52c41a';
    case 'failed':
      return '#ff4d4f';
    case 'uploading':
      return '#1677ff';
    default:
      return '#8c8c8c';
  }
};

export const UploadModal = ({ parentId, onSuccess }: UploadModalProps) => {
  const [dragging, setDragging] = useState(false);
  const { token } = useToken();
  const upload = useFileStore((state) => state.upload);

  const handleDrop = (e: React.DragEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      upload.selectFile(files[0]);
    }
  };

  const handleSelectFile = () => {
    (upload.fileInputRef as React.RefObject<HTMLInputElement>).current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.selectFile(file);
    e.target.value = '';
  };

  const handleUpload = () => {
    upload.uploadFile(parentId, onSuccess);
  };

  const file = upload.currentFile;
  const isUploading = upload.uploading;
  const canUpload = !isUploading;

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: token.colorText }}>
          上传文件
        </Title>
      }
      open={upload.isModalOpen}
      onCancel={upload.closeModal}
      closable
      maskClosable={false}
      keyboard={false}
      footer={null}
      width={520}
      styles={{ body: { padding: '16px 24px' }, content: { height: 400 } }}
    >
      <input
        type="file"
        ref={upload.fileInputRef as React.RefObject<HTMLInputElement>}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* 拖拽区域 / 文件展示区域 */}
      {!file ? (
        <button
          type="button"
          onClick={handleSelectFile}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ')') {
              handleSelectFile();
            }
          }}
          onDrop={handleDrop}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          style={{
            height: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            border: dragging
              ? `2px dashed ${token.colorPrimary}`
              : `2px dashed ${token.colorBorder}`,
            borderRadius: 12,
            background: dragging
              ? `linear-gradient(135deg, ${token.colorPrimary}10 0%, ${token.colorPrimary}05 100%)`
              : token.colorFillQuaternary,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: 16,
            width: '100%',
            font: 'inherit',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: dragging
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : `linear-gradient(135deg, ${token.colorPrimary}08 0%, ${token.colorPrimary}05 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: dragging ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
              boxShadow: dragging ? `0 8px 24px ${token.colorPrimary}30` : 'none',
            }}
          >
            <UploadOutlined
              style={{
                fontSize: 36,
                color: dragging ? '#fff' : token.colorPrimary,
                transition: 'color 0.2s ease',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text
              strong
              style={{
                fontSize: 16,
                display: 'block',
                color: dragging ? token.colorPrimary : token.colorText,
              }}
            >
              {dragging ? '释放以上传文件' : '拖拽文件到这里上传'}
            </Text>
            <Text style={{ fontSize: 13, color: token.colorTextTertiary }}>或点击选择文件</Text>
          </div>
        </button>
      ) : (
        <div
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* 文件项 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              background: file.status === 'uploading' ? `${token.colorPrimary}08` : 'transparent',
            }}
          >
            {/* 文件图标 */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${getStatusColor(file.status)}15 0%, ${getStatusColor(file.status)}08 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                flexShrink: 0,
                border: `1px solid ${getStatusColor(file.status)}20`,
              }}
            >
              {file.status === 'completed' ? (
                <CheckCircleOutlined style={{ fontSize: 18, color: getStatusColor(file.status) }} />
              ) : file.status === 'failed' ? (
                <CloseCircleOutlined style={{ fontSize: 18, color: getStatusColor(file.status) }} />
              ) : (
                <FileOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
              )}
            </div>

            {/* 文件信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                ellipsis
                style={{
                  display: 'block',
                  fontWeight: 500,
                  fontSize: 14,
                  marginBottom: 2,
                  color: token.colorText,
                }}
              >
                {file.file.name}
              </Text>
              <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
                {formatSize(file.file.size)}
                {file.status === 'failed' && (
                  <Text type="danger" style={{ fontSize: 12, marginLeft: 8 }}>
                    上传失败
                  </Text>
                )}
              </Text>
            </div>

            {/* 进度条 */}
            <div style={{ width: 100, margin: '0 16px', flexShrink: 0 }}>
              {(file.status === 'uploading' || file.status === 'paused') && (
                <Progress
                  percent={file.progress}
                  size="small"
                  strokeColor={token.colorPrimary}
                  trailColor={token.colorFillSecondary}
                />
              )}
            </div>

            {/* 操作按钮 */}
            {(file.status === 'uploading' || file.status === 'paused') &&
              <Space size={4} style={{ flexShrink: 0 }}>
                {file.status === 'paused' ? (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<PlayCircleOutlined />}
                    onClick={handleUpload}
                    style={{ borderRadius: 4 }}
                  ></Button>
                ) : (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<PauseOutlined />}
                    onClick={upload.pauseUpload}
                    style={{ borderRadius: 4 }}
                  >
                  </Button>
                )}
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={upload.cancelUpload}
                  style={{ borderRadius: 4 }}
                >
                </Button>
              </Space>
            }
          </div>
        </div>
      )}

      {/* 底部按钮 */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <Button
          type="primary"
          onClick={handleUpload}
          loading={isUploading}
          icon={<UploadOutlined />}
          style={{ borderRadius: 6, opacity: canUpload ? 1 : 0 }}
        >
          开始上传
        </Button>
      </div>
    </Modal>
  );
};
