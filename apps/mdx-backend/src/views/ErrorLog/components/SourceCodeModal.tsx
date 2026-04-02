import { Modal } from "antd";
import type React from "react";
import { FormattedMessage } from "react-intl";
import type { SourceCodeModalProps } from "../types/errorLogType";

const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
	open,
	onCancel,
	data,
}) => {
	if (!data) return null;

	return (
		<Modal
			open={open}
			title={<FormattedMessage id="viewSourceCode" />}
			footer={null}
			onCancel={onCancel}
			width={800}
			centered
		>
			<div style={{ marginBottom: 16 }}>
				<p style={{ marginBottom: 4 }}>
					<strong>
						<FormattedMessage id="file" />:
					</strong>{" "}
					<code style={{ color: "#c41d7f" }}>{data.result.source}</code>
				</p>
				<p style={{ marginBottom: 0 }}>
					<strong>
						<FormattedMessage id="location" />:
					</strong>{" "}
					<FormattedMessage id="line" values={{ line: data.result.line }} />,{" "}
					<FormattedMessage
						id="column"
						values={{ column: data.result.column }}
					/>
				</p>
			</div>

			<div
				style={{
					background: "#1e1e1e", // 改为深色主题更像编辑器
					color: "#d4d4d4",
					padding: "12px",
					overflowX: "auto",
					fontFamily: "'Fira Code', 'Courier New', monospace",
					fontSize: "13px",
					lineHeight: "1.6",
					borderRadius: "8px",
					border: "1px solid #333",
				}}
			>
				{/* 注意：这里 data.codeSnippet 已经是一个数组了 */}
				{data.codeSnippet.map((item: any, i: number) => {
					const isError = item.isErrorLine;
					return (
						<div
							key={i}
							style={{
								backgroundColor: isError
									? "rgba(255, 77, 79, 0.2)"
									: "transparent",
								display: "flex",
								padding: "0 4px",
								borderLeft: isError
									? "3px solid #ff4d4f"
									: "3px solid transparent",
							}}
						>
							<span
								style={{
									color: isError ? "#ff7875" : "#858585",
									width: "40px",
									textAlign: "right",
									marginRight: "16px",
									userSelect: "none",
								}}
							>
								{item.line}
							</span>
							<pre style={{ margin: 0, whiteSpace: "pre" }}>
								{item.content || " "}
							</pre>
						</div>
					);
				})}
			</div>
		</Modal>
	);
};

export default SourceCodeModal;
