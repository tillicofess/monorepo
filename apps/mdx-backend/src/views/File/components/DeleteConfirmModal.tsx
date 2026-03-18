import { Modal, Typography } from "antd";
import { useIntl } from "react-intl";
import { useFileStore } from "../store/useFileStore";
import type { DeleteConfirmModalProps } from "../types";

export function DeleteConfirmModal({ onSuccess }: DeleteConfirmModalProps) {
	const intl = useIntl();
	const { delete: deleteState } = useFileStore();

	const isMultiple = deleteState.multiple.ids.length > 0;
	const count = isMultiple ? deleteState.multiple.ids.length : 1;

	return (
		<Modal
			title={intl.formatMessage({ id: "deleteTitle" })}
			open={deleteState.isOpen}
			onOk={() => deleteState.submit(onSuccess)}
			confirmLoading={deleteState.loading}
			onCancel={deleteState.close}
			destroyOnHidden
			okButtonProps={{ danger: true }}
		>
			<Typography.Text>
				{isMultiple
					? intl.formatMessage({ id: "confirmDeleteMultiple" }, { count })
					: intl.formatMessage(
							{ id: "confirmDelete" },
							{ name: deleteState.fileInfo.name },
						)}
			</Typography.Text>
		</Modal>
	);
}
