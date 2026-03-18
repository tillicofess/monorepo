import { Input, Modal } from "antd";
import { useIntl } from "react-intl";
import { useFileStore } from "../store/useFileStore";
import type { CreateFolderModalProps } from "../types";

export function CreateFolderModal({
	parentId,
	onSuccess,
}: CreateFolderModalProps) {
	const intl = useIntl();
	const { createFolder } = useFileStore();

	return (
		<Modal
			title={intl.formatMessage({ id: "createFolderTitle" })}
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
				placeholder={intl.formatMessage({ id: "enterFolderName" })}
				value={createFolder.name}
				maxLength={100}
				onChange={(e) => createFolder.setName(e.target.value)}
				onPressEnter={() => createFolder.submit(parentId, onSuccess)}
				autoFocus
			/>
		</Modal>
	);
}
