import { Input, Modal } from 'antd';

export interface CreateFolderModalProps {
  open: boolean;
  folderName: string;
  loading: boolean;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateFolderModal({
  open,
  folderName,
  loading,
  onNameChange,
  onSubmit,
  onCancel,
}: CreateFolderModalProps) {
  return (
    <Modal
      title="新建文件夹"
      open={open}
      onOk={onSubmit}
      confirmLoading={loading}
      okButtonProps={{
        disabled: !folderName.trim(),
      }}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Input
        placeholder="请输入文件夹名称"
        value={folderName}
        maxLength={100}
        onChange={(e) => onNameChange(e.target.value)}
        onPressEnter={onSubmit}
        autoFocus
      />
    </Modal>
  );
}
