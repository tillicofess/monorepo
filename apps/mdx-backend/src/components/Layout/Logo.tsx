import { Typography } from "antd";

const { Text } = Typography;

interface LogoProps {
	collapsed?: boolean;
	themeMode: "light" | "dark";
}

export function Logo({ collapsed }: LogoProps) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: collapsed ? "6px 10px" : "8px 14px",
				borderRadius: collapsed ? 8 : 10,
				transition: "all 0.2s ease",
			}}
		>
			<img
				src="/logo.svg"
				alt="Vista"
				style={{
					width: collapsed ? 24 : 28,
					height: collapsed ? 24 : 28,
					objectFit: "contain",
				}}
			/>
			{!collapsed && (
				<Text
					style={{
						margin: 0,
						fontWeight: 700,
						fontSize: 16,
						letterSpacing: "0.5px",
						whiteSpace: "nowrap",
					}}
				>
					Vista
				</Text>
			)}
		</div>
	);
}
