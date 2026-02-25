import { Button, Space } from 'antd';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { useAbility } from '@/providers/AbilityProvider';
import { useFileStore } from '../store/useFileStore';

export function FileActions() {
  const ability = useAbility();
  const { createFolder, upload, delete: deleteState, selectedRowKeys } = useFileStore();

  const hasSelection = selectedRowKeys.length > 0;

  const handleDelete = () => {
    if (hasSelection) {
      const ids = selectedRowKeys.map(String);
      const names = ids.map(() => '选中项');
      const isDirs = ids.map(() => false);
      deleteState.openMultiple(ids, names, isDirs);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '8px 0',
      }}
    >
      <Space>
        <Button
          icon={<FolderPlus size={16} />}
          onClick={createFolder.open}
          disabled={!ability.can('create', 'editor')}
        >
          新建文件夹
        </Button>
        <Button type="primary" icon={<Plus size={16} />} onClick={upload.openModal}>
          上传文件
        </Button>
        {hasSelection && (
          <Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>
            删除 ({selectedRowKeys.length})
          </Button>
        )}
      </Space>
    </div>
  );
}
