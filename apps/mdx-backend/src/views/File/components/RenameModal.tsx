import { Input, Modal } from 'antd';
import type { FileNameState } from '../types';

export interface RenameModalProps {
  open: boolean;
  fileName: FileNameState;
  loading: boolean;
  onNameChange: (name: FileNameState) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function RenameModal({
  open,
  fileName,
  loading,
  onNameChange,
  onSubmit,
  onCancel,
}: RenameModalProps) {
  return (
    <Modal
      title="重命名"
      open={open}
      onOk={onSubmit}
      confirmLoading={loading}
      okButtonProps={{
        disabled: !fileName.name.trim(),
      }}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Input
        value={fileName.name}
        maxLength={100}
        onChange={(e) =>
          onNameChange({
            id: fileName.id,
            name: e.target.value,
          })
        }
        onPressEnter={onSubmit}
        autoFocus
      />
    </Modal>
  );
}
