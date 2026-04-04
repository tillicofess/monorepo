import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Typography, theme } from "antd";

const { Text } = Typography;

interface LogoProps {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	themeMode: "light" | "dark";
}

export function Logo({ collapsed, setCollapsed }: LogoProps) {
	const { token } = theme.useToken();
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: collapsed ? "center" : "space-between",
				height: 32,
				padding: collapsed ? "0" : "0 4px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					overflow: "hidden",
				}}
			>
				<img
					src="/logo.svg"
					alt="Vista"
					style={{
						width: 24,
						height: 24,
						flexShrink: 0,
						display: collapsed ? "none" : "block",
					}}
				/>
				<Text
					style={{
						fontWeight: 700,
						fontSize: 16,
						margin: 0,
						whiteSpace: "nowrap",
						display: collapsed ? "none" : "block",
					}}
				>
					Vista
				</Text>
			</div>
			<Button
				type="text"
				icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				onClick={() => setCollapsed(!collapsed)}
				style={{
					width: 32,
					height: 32,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: token.colorTextTertiary,
				}}
			/>
		</div>
	);
}
