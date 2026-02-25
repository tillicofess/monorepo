import { Input, Modal } from 'antd';
import { useFileStore } from '../store/useFileStore';

interface CreateFolderModalProps {
  parentId: string | null;
  onSuccess: () => void;
}

export function CreateFolderModal({ parentId, onSuccess }: CreateFolderModalProps) {
  const { createFolder } = useFileStore();

  return (
    <Modal
      title="新建文件夹"
      open={createFolder.isOpen}
      onOk={() => createFolder.submit(parentId, onSuccess)}
      confirmLoading={createFolder.loading}
      okButtonProps={{
        disabled: !createFolder.name.trim(),
      }}
      onCancel={createFolder.close}
      destroyOnHidden
    >
      <Input
        placeholder="请输入文件夹名称"
        value={createFolder.name}
        maxLength={100}
        onChange={(e) => createFolder.setName(e.target.value)}
        onPressEnter={() => createFolder.submit(parentId, onSuccess)}
        autoFocus
      />
    </Modal>
  );
}
