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
      width={800}
      styles={{
        body: { padding: '20px 24px' },
        content: { minHeight: 480, maxHeight: 600 },
        header: { padding: '16px 24px', marginBottom: 0 },
      }}
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
            if (e.key === 'Enter') {
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
            height: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            border: dragging
              ? `2px dashed ${token.colorPrimary}`
              : `1px dashed ${token.colorBorder}`,
            borderRadius: 12,
            background: dragging ? `${token.colorPrimaryBg}` : token.colorFillQuaternary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 24,
            width: '100%',
            font: 'inherit',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: dragging ? token.colorPrimary : `${token.colorPrimaryBg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <UploadOutlined
              style={{
                fontSize: 28,
                color: dragging ? '#fff' : token.colorPrimary,
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text
              strong
              style={{
                fontSize: 15,
                display: 'block',
                color: dragging ? token.colorPrimary : token.colorText,
              }}
            >
              {dragging ? '释放以上传文件' : '拖拽文件到这里上传'}
            </Text>
            <Text style={{ fontSize: 13, color: token.colorTextQuaternary }}>或点击选择文件</Text>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSelectFile}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSelectFile();
            }
          }}
          style={{
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: 8,
            padding: '10px 16px',
            background: 'transparent',
            cursor: 'pointer',
            width: '100%',
            font: 'inherit',
            color: token.colorTextSecondary,
            transition: 'all 0.2s ease',
          }}
        >
          <UploadOutlined />
          <Text style={{ fontSize: 13 }}>点击添加更多文件</Text>
        </button>
      )}

      {/* 文件列表 */}
      {upload.queue.length > 0 && (
        <div
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 8,
            overflow: 'hidden',
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {upload.queue.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: task.status === 'uploading' ? `${token.colorPrimaryBg}` : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              {/* 文件图标 */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${getStatusColor(task.status)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  flexShrink: 0,
                }}
              >
                {task.status === 'completed' ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 16, color: getStatusColor(task.status) }}
                  />
                ) : task.status === 'failed' ? (
                  <CloseCircleOutlined
                    style={{ fontSize: 16, color: getStatusColor(task.status) }}
                  />
                ) : (
                  <FileOutlined style={{ fontSize: 16, color: token.colorTextQuaternary }} />
                )}
              </div>

              {/* 文件信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  ellipsis
                  style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 1 }}
                >
                  {task.file.name}
                </Text>
                <Text style={{ fontSize: 12, color: token.colorTextQuaternary }}>
                  {formatSize(task.file.size)}
                  {task.status === 'failed' && (
                    <Text type="danger" style={{ fontSize: 12, marginLeft: 6 }}>
                      上传失败
                    </Text>
                  )}
                </Text>
              </div>

              {/* 进度条 */}
              <div style={{ width: 80, margin: '0 12px', flexShrink: 0 }}>
                {(task.status === 'uploading' || task.status === 'paused') && (
                  <Progress
                    percent={task.progress}
                    size="small"
                    strokeColor={token.colorPrimary}
                    trailColor={token.colorFillSecondary}
                    format={(percent) => `${percent}%`}
                  />
                )}
              </div>

              {/* 操作按钮 */}
              <Space size={2} style={{ flexShrink: 0 }}>
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
                      type="link"
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
