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

	const startLine = data.result.line - 10;

	return (
		<Modal
			open={open}
			title={<FormattedMessage id="viewSourceCode" />}
			footer={null}
			onCancel={onCancel}
			width={800}
		>
			<p>
				<strong>
					<FormattedMessage id="file" />:
				</strong>{" "}
				{data.result.source}
			</p>
			<p>
				<strong>
					<FormattedMessage id="location" />:
				</strong>{" "}
				<FormattedMessage id="line" values={{ line: data.result.line }} />,{" "}
				<FormattedMessage id="column" values={{ column: data.result.column }} />
			</p>
			<div
				style={{
					background: "#f6f6f6",
					padding: "10px",
					overflowX: "auto",
					fontFamily: "monospace",
					fontSize: "14px",
					lineHeight: "1.6",
				}}
			>
				{data.codeSnippet.split("\n").map((line, i) => {
					const currentLine = startLine + i;
					const isError = currentLine === data.result.line;
					return (
						<div
							key={i}
							style={{
								backgroundColor: isError ? "#ffecec" : undefined,
								color: isError ? "#d32f2f" : undefined,
								fontWeight: isError ? "bold" : undefined,
								padding: "2px 6px",
								borderRadius: "4px",
							}}
						>
							<span style={{ color: "#999", marginRight: 10 }}>
								{String(currentLine).padStart(4, " ")}:
							</span>
							{line}
						</div>
					);
				})}
			</div>
		</Modal>
	);
};

export default SourceCodeModal;
