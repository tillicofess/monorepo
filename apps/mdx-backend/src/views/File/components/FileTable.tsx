import { FolderOpenOutlined, HolderOutlined } from "@ant-design/icons";
import type { TableColumnsType, TableProps } from "antd";
import { Button, Space, Table } from "antd";
import { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { downloadFile } from "@/apis/index";
import DraggableRow from "@/components/DraggableRow";
import { RowContext } from "@/components/DraggableRow.tsx";
import { TableFolderDroppable } from "@/components/DroppableNode.tsx";
import { useAbility } from "@/providers/AbilityProvider";
import { formatFileSize } from "@/utils/utils";
import { getFileIcon } from "../data/fileIcon";
import { useFileStore } from "../store/newUseFileStore";
import type { FileItem, FileTableProps } from "../types";

type TableRowSelection<T extends object = object> =
	TableProps<T>["rowSelection"];

const DragHandle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { setActivatorNodeRef, listeners } = useContext(RowContext);

	return (
		<span
			ref={setActivatorNodeRef}
			{...listeners}
			style={{ cursor: "grab", display: "inline-flex", alignItems: "center" }}
		>
			{children}
		</span>
	);
};

export function FileTable({
	fileList,
	isLoading,
	onEnterFolder,
	onRename,
	onDelete,
}: FileTableProps) {
	const ability = useAbility();
	const { selectedRowKeys, setSelectedRowKeys } = useFileStore();

	const columns: TableColumnsType<FileItem> = [
		{
			title: <FormattedMessage id="fileName" defaultMessage="File Name" />,
			dataIndex: "name",
			key: "name",
			width: 240,
			ellipsis: true,
			render: (text: string, record: FileItem) => {
				const isDir = record.isDir;

				const content = (
					<Space size="small">
						<DragHandle>
							<HolderOutlined style={{ color: "#999" }} />
						</DragHandle>

						{isDir ? (
							<FolderOpenOutlined style={{ color: "#6366F1" }} />
						) : (
							getFileIcon(record.fileType)
						)}

						{text}
					</Space>
				);

				return isDir ? (
					<TableFolderDroppable folder={record}>{content}</TableFolderDroppable>
				) : (
					content
				);
			},
			filters: [
				{ text: <FormattedMessage id="folders" />, value: 1 },
				{ text: <FormattedMessage id="files" />, value: 0 },
			],
			onFilter: (value, record) => record.isDir === value,
		},
		{
			title: <FormattedMessage id="fileSize" defaultMessage="File Size" />,
			dataIndex: "size",
			key: "size",
			width: 100,
			render: (size: number, record: FileItem) =>
				record.isDir ? "-" : formatFileSize(size),
			sorter: (a: FileItem, b: FileItem) => a.size - b.size,
		},
		{
			title: <FormattedMessage id="uploadDate" defaultMessage="Upload Date" />,
			dataIndex: "uploadTime",
			key: "uploadTime",
			width: 180,
			render: (uploadTime: string) => {
				return new Date(uploadTime).toLocaleString();
			},
		},
		{
			title: <FormattedMessage id="action" />,
			key: "action",
			width: 240,
			render: (record: FileItem) => (
				<Space size="small">
					<Button
						type="text"
						size="small"
						onClick={() => onRename(record.id, record.name)}
					>
						<FormattedMessage id="rename" />
					</Button>
					<Button
						type="text"
						size="small"
						danger
						onClick={() => onDelete(record.id, record.name, record.isDir)}
						disabled={!ability.can("delete", "editor")}
					>
						<FormattedMessage id="delete" />
					</Button>
					{!record.isDir && (
						<Button
							type="link"
							size="small"
							onClick={() => downloadFile(record.id)}
						>
							<FormattedMessage id="download" />
						</Button>
					)}
				</Space>
			),
		},
	];

	const rowSelection: TableRowSelection<FileItem> = {
		selectedRowKeys,
		onChange: setSelectedRowKeys,
	};

	return (
		<Table
			size="small"
			scroll={{ x: "max-content", y: 520 }}
			rowKey={(record) => record.id}
			columns={columns}
			loading={isLoading}
			dataSource={fileList as FileItem[]}
			pagination={false}
			onRow={(record) => {
				return {
					onDoubleClick: () => onEnterFolder(record),
					style: { cursor: record.isDir ? "pointer" : "default" },
				};
			}}
			components={{
				body: {
					row: DraggableRow,
				},
			}}
			rowSelection={rowSelection}
		/>
	);
}
