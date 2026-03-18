import { Button, Space } from "antd";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { useAbility } from "@/providers/AbilityProvider";
import { useFileStore } from "../store/useFileStore";

export function FileActions() {
	const ability = useAbility();
	const {
		createFolder,
		upload,
		delete: deleteState,
		selectedRowKeys,
	} = useFileStore();

	const hasSelection = selectedRowKeys.length > 0;

	const handleDelete = () => {
		if (hasSelection) {
			const ids = selectedRowKeys.map(String);
			const names = ids.map(() => "selectedItems");
			const isDirs = ids.map(() => false);
			deleteState.openMultiple(ids, names, isDirs);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				paddingBottom: 12,
				borderBottom: "1px solid var(--ant-colorBorderSecondary)",
				marginBottom: 8,
			}}
		>
			<Space>
				<Button
					icon={<FolderPlus size={16} />}
					onClick={createFolder.open}
					disabled={!ability.can("create", "editor")}
				>
					<FormattedMessage id="createFolder" />
				</Button>
				<Button
					type="primary"
					icon={<Plus size={16} />}
					onClick={upload.openModal}
				>
					<FormattedMessage id="uploadFiles" />
				</Button>
			</Space>
			{hasSelection && (
				<Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>
					<FormattedMessage id="delete" /> ({selectedRowKeys.length})
				</Button>
			)}
		</div>
	);
}
