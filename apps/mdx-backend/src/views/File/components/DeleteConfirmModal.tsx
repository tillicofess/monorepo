import { Modal, Typography } from 'antd';
import { useFileStore } from '../store/useFileStore';

interface DeleteConfirmModalProps {
  onSuccess: () => void;
}

export function DeleteConfirmModal({ onSuccess }: DeleteConfirmModalProps) {
  const { delete: deleteState } = useFileStore();

  const isMultiple = deleteState.multiple.ids.length > 0;
  const count = isMultiple ? deleteState.multiple.ids.length : 1;

  return (
    <Modal
      title="删除"
      open={deleteState.isOpen}
      onOk={() => deleteState.submit(onSuccess)}
      confirmLoading={deleteState.loading}
      onCancel={deleteState.close}
      destroyOnHidden
      okButtonProps={{ danger: true }}
    >
      <Typography.Text>
        {isMultiple
          ? `确认删除 ${count} 个选中项吗？此操作不可恢复。`
          : `${deleteState.fileInfo.isDir ? '确认删除文件夹' : '确认删除文件'} "${
              deleteState.fileInfo.name
            }" 吗？此操作不可恢复。`}
      </Typography.Text>
    </Modal>
  );
}
