import type { TableProps } from "antd";
import { Button, Table, Tooltip } from "antd";
import { Code, Play } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { throttle } from "@/utils/throttle";
import type {
	DataType,
	ErrorLogTableProps,
} from "@/views/ErrorLog/types/errorLogType";

const ErrorLogTable: React.FC<ErrorLogTableProps> = ({
	data,
	loading,
	onViewSourceCode,
	onViewActions,
}) => {
	const handleViewSourceCode = useCallback(
		throttle((completeError: any) => {
			onViewSourceCode(completeError);
		}, 500),
		[onViewSourceCode],
	);

	const handleViewActions = useCallback(
		throttle((actions: any[]) => {
			onViewActions(actions);
		}, 500),
		[onViewActions],
	);

	const columns: TableProps<DataType>["columns"] = [
		{
			title: <FormattedMessage id="projectName" defaultMessage="项目名称" />,
			dataIndex: "app_name",
			key: "app_name",
			width: 150,
		},
		{
			title: <FormattedMessage id="errorMessage" defaultMessage="错误信息" />,
			dataIndex: "error",
			key: "error",
			minWidth: 300,
			render: (text) => {
				const message = text?.message || "";
				return (
					<Tooltip title={message} placement="topLeft">
						<div
							style={{
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
								wordBreak: "break-word",
								cursor: "pointer",
							}}
						>
							{message}
						</div>
					</Tooltip>
				);
			},
		},
		{
			title: <FormattedMessage id="errorType" defaultMessage="错误类型" />,
			dataIndex: "error",
			key: "sub_type",
			render: (text) => <span>{text?.category}</span>,
		},
		{
			title: <FormattedMessage id="errorTime" defaultMessage="错误时间" />,
			dataIndex: "time",
			key: "time",
		},
		{
			title: <FormattedMessage id="version" defaultMessage="版本" />,
			dataIndex: "version",
			key: "version",
		},
		{
			title: <FormattedMessage id="viewSourceCode" defaultMessage="源码" />,
			key: "code",
			width: 120,
			align: "center",
			render: (_, record) => {
				const error = record.error;
				const hasSourceInfo = error?.debug_id;

				if (!hasSourceInfo) return null;

				return (
					<Button
						type="primary"
						size="small"
						icon={<Code size={14} />}
						onClick={() =>
							handleViewSourceCode({
								debug_id: error.debug_id,
								line: error.line,
								column: error.column,
							})
						}
					>
						<FormattedMessage id="sourceCode" />
					</Button>
				);
			},
		},
		{
			title: (
				<FormattedMessage id="userOperationRecords" defaultMessage="操作记录" />
			),
			dataIndex: "operation",
			key: "operation",
			width: 120,
			align: "center",
			render: (_, { actions }) =>
				actions?.length > 0 ? (
					<Button
						type="primary"
						size="small"
						icon={<Play size={14} />}
						onClick={() => handleViewActions(actions)}
					>
						<FormattedMessage id="view" />
					</Button>
				) : null,
		},
		{
			title: <FormattedMessage id="count" defaultMessage="次数" />,
			dataIndex: "count",
			key: "count",
			width: 100,
			align: "center",
		},
	];

	return (
		<Table<DataType>
			columns={columns}
			dataSource={data}
			loading={loading}
			style={{ borderRadius: "8px", overflow: "hidden" }}
			pagination={{
				showSizeChanger: true,
				showQuickJumper: true,
				showTotal: (total) => (
					<FormattedMessage id="totalItems" values={{ total }} />
				),
				defaultPageSize: 10,
				pageSizeOptions: ["10", "20", "50"],
			}}
		/>
	);
};

export default ErrorLogTable;
