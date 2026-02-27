import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FileOutlined,
  PauseOutlined,
  PlayCircleOutlined,
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
    if (files.length > 0) {
      upload.addFiles(files);
    }
  };

  const handleSelectFile = () => {
    (upload.fileInputRef as React.RefObject<HTMLInputElement>).current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      upload.addFiles(files);
    }
    e.target.value = '';
  };

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
        multiple
      />

      {/* 拖拽区域 / 文件展示区域 */}
      {upload.queue.length === 0 ? (
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
        <button
          type="button"
          onClick={handleSelectFile}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ')') {
              handleSelectFile();
            }
          }}
          style={{
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: 8,
            padding: '8px 16px',
            background: 'transparent',
            cursor: 'pointer',
            width: '100%',
            font: 'inherit',
            color: token.colorTextSecondary,
            transition: 'all 0.2s ease',
          }}
        >
          <UploadOutlined />
          <Text>点击添加更多文件</Text>
        </button>
      )}

      {/* 文件列表 */}
      {upload.queue.length > 0 && (
        <div
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 8,
            overflow: 'hidden',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {upload.queue.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: `1px solid ${token.colorBorder}`,
                background: task.status === 'uploading' ? `${token.colorPrimary}08` : 'transparent',
              }}
            >
              {/* 文件图标 */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${getStatusColor(task.status)}15 0%, ${getStatusColor(task.status)}08 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  flexShrink: 0,
                  border: `1px solid ${getStatusColor(task.status)}20`,
                }}
              >
                {task.status === 'completed' ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 18, color: getStatusColor(task.status) }}
                  />
                ) : task.status === 'failed' ? (
                  <CloseCircleOutlined
                    style={{ fontSize: 18, color: getStatusColor(task.status) }}
                  />
                ) : (
                  <FileOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
                )}
              </div>

              {/* 文件信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  ellipsis
                  style={{ display: 'block', fontWeight: 500, fontSize: 14, marginBottom: 2 }}
                >
                  {task.file.name}
                </Text>
                <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
                  {formatSize(task.file.size)}
                  {task.status === 'failed' && (
                    <Text type="danger" style={{ fontSize: 12, marginLeft: 8 }}>
                      上传失败
                    </Text>
                  )}
                </Text>
              </div>

              {/* 进度条 */}
              <div style={{ width: 100, margin: '0 16px', flexShrink: 0 }}>
                {(task.status === 'uploading' || task.status === 'paused') && (
                  <Progress
                    percent={task.progress}
                    size="small"
                    strokeColor={token.colorPrimary}
                    trailColor={token.colorFillSecondary}
                  />
                )}
              </div>

              {/* 操作按钮 */}
              <Space size={4} style={{ flexShrink: 0 }}>
                {task.status === 'pending' && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => upload.removeTask(task.id)}
                  />
                )}
                {task.status === 'uploading' && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<PauseOutlined />}
                      onClick={() => upload.pauseTask(task.id)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => upload.cancelTask(task.id)}
                    />
                  </>
                )}
                {task.status === 'paused' && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => upload.resumeTask(task.id, parentId)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => upload.cancelTask(task.id)}
                    />
                  </>
                )}
                {task.status === 'failed' && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => upload.retryTask(task.id, parentId)}
                    >
                      重试
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => upload.removeTask(task.id)}
                    />
                  </>
                )}
                {task.status === 'completed' && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => upload.removeTask(task.id)}
                  />
                )}
              </Space>
            </div>
          ))}
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
          onClick={() => upload.startUpload(parentId, onSuccess)}
          loading={upload.queue.some((t) => t.status === 'uploading')}
          icon={<UploadOutlined />}
          disabled={!upload.queue.some((t) => t.status === 'pending')}
        >
          开始上传
        </Button>
      </div>
    </Modal>
  );
};
