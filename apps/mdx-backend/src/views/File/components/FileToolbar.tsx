import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { FileUp, FolderPlus, Upload, X } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useAbility } from '@/providers/AbilityProvider';

export interface FileToolbarProps {
  uploading: boolean;
  selectedFile: File | null;
  onCreateFolder: () => void;
  onOpenFileDialog: () => void;
  onUpload: () => void;
  onAbort: () => void;
}

export function FileToolbar({
  uploading,
  selectedFile,
  onCreateFolder,
  onOpenFileDialog,
  onUpload,
  onAbort,
}: FileToolbarProps) {
  const ability = useAbility();

  return (
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
        <Button icon={<FolderPlus size={16} />} onClick={onCreateFolder} disabled={uploading}>
          新建文件夹
        </Button>
        <Button
          type="primary"
          icon={<FileUp size={16} />}
          onClick={onOpenFileDialog}
          disabled={uploading}
        >
          选择文件
        </Button>
        <Button
          type="primary"
          icon={<Upload size={16} />}
          onClick={onUpload}
          loading={uploading}
          disabled={!selectedFile || uploading || !ability.can('upload', 'largeFile')}
        >
          上传文件
        </Button>
        <Button icon={<X size={16} />} onClick={onAbort} disabled={!uploading} danger={uploading}>
          取消上传
        </Button>
      </Space>
    </div>
  );
}
