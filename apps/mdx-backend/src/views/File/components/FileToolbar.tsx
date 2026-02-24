import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { FolderPlus, Plus } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useAbility } from '@/providers/AbilityProvider';

export interface FileToolbarProps {
  onCreateFolder: () => void;
  onOpenUploadModal: () => void;
}

export function FileToolbar({ onCreateFolder, onOpenUploadModal }: FileToolbarProps) {
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
        <Button
          icon={<FolderPlus size={16} />}
          onClick={onCreateFolder}
          disabled={!ability.can('create', 'editor')}
        >
          新建文件夹
        </Button>
        <Button type="primary" icon={<Plus size={16} />} onClick={onOpenUploadModal}>
          上传文件
        </Button>
      </Space>
    </div>
  );
}
