import { Button, Drawer, theme } from "antd";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { MobileSiderContent } from "./index";

export function Header() {
	const { token } = theme.useToken();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		// Close drawer on route change
		setDrawerOpen(false);
	}, [location]);

	return (
		<>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					height: 42,
					padding: "0 16px",
					background: token.colorBgContainer,
					border: `1px solid ${token.colorBorderSecondary}`,
					gap: 12,
					borderRadius: 8,
				}}
			>
				<Button
					type="text"
					icon={<Menu size={20} style={{ color: token.colorTextTertiary }} />}
					onClick={() => setDrawerOpen(true)}
					style={{
						width: 40,
						height: 40,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				/>

				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
					}}
				>
					<img
						src="/logo.svg"
						alt="Vista"
						style={{ width: 24, height: 24, flexShrink: 0 }}
					/>
					<span
						style={{
							fontWeight: 700,
							fontSize: 16,
							color: token.colorText,
						}}
					>
						Vista
					</span>
				</div>

				<div style={{ width: 40 }} />
			</div>

			<Drawer
				placement="left"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				size={280}
				styles={{
					body: { padding: 12, background: token.colorBgContainer },
					header: { display: "none" },
				}}
			>
				<MobileSiderContent />
			</Drawer>
		</>
	);
}
