import { Modal, Typography } from 'antd';
import type { DeleteFileState } from '../types';

export interface DeleteConfirmModalProps {
  open: boolean;
  fileInfo: DeleteFileState;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  open,
  fileInfo,
  loading,
  onSubmit,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      title="删除"
      open={open}
      onOk={onSubmit}
      confirmLoading={loading}
      onCancel={onCancel}
      destroyOnHidden
      okButtonProps={{ danger: true }}
    >
      <Typography.Text>
        {fileInfo.isDir ? '确认删除文件夹' : '确认删除文件'} "{fileInfo.name}" 吗？此操作不可恢复。
      </Typography.Text>
    </Modal>
  );
}
