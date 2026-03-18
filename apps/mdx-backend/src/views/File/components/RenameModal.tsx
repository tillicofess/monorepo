import { Input, Modal } from "antd";
import { useIntl } from "react-intl";
import { useFileStore } from "../store/useFileStore";

interface RenameModalProps {
	onSuccess: () => void;
}

export function RenameModal({ onSuccess }: RenameModalProps) {
	const intl = useIntl();
	const { rename } = useFileStore();

	return (
		<Modal
			title={intl.formatMessage({ id: "renameTitle" })}
			open={rename.isOpen}
			onOk={() => rename.submit(onSuccess)}
			confirmLoading={rename.loading}
			okButtonProps={{
				disabled: !rename.fileName.name.trim(),
			}}
			onCancel={rename.close}
			destroyOnHidden
		>
			<Input
				value={rename.fileName.name}
				maxLength={100}
				onChange={(e) =>
					rename.setFileName({
						id: rename.fileName.id,
						name: e.target.value,
					})
				}
				onPressEnter={() => rename.submit(onSuccess)}
				autoFocus
			/>
		</Modal>
	);
}
