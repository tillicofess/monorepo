import { Button, theme } from "antd";
import { Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "@/providers/auth/auth";
import { useLocale } from "@/providers/LocaleContext";
import { Sidebar, UserMenu } from "./index";

export function MobileSiderContent() {
	const location = useLocation();
	const { token } = theme.useToken();
	const [selectedKey, setSelectedKey] = useState<string[]>([]);
	const [openKeys, setOpenKeys] = useState<string[]>(["sub2"]);
	const { user, logout } = useAuth();
	const { lang, themeMode, changeLang, changeThemeMode } = useLocale();

	useEffect(() => {
		const path = location.pathname;
		setSelectedKey([path]);
		const parentPath = `/${path.split("/")[1]}`;
		if (parentPath && parentPath !== "/") {
			setOpenKeys((prev) =>
				prev.includes(parentPath) ? prev : [...prev, parentPath],
			);
		}
	}, [location]);

	const handleOpenChange = (keys: string[]) => {
		setOpenKeys(keys);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				gap: 16,
			}}
		>
			<UserMenu
				collapsed={false}
				userName={user?.name ?? "User"}
				onLogout={logout}
			/>

			<div style={{ flex: 1, overflow: "auto" }}>
				<Sidebar
					selectedKey={selectedKey}
					openKeys={openKeys}
					collapsed={false}
					themeMode={themeMode}
					onOpenChange={handleOpenChange}
					onMenuClick={() => {}}
				/>
			</div>

			<div
				style={{
					padding: "16px 0",
					display: "flex",
					alignItems: "center",
					gap: "16px",
				}}
			>
				<Button
					type="text"
					icon={<Globe size={18} style={{ color: token.colorTextTertiary }} />}
					onClick={() => changeLang(lang === "en-US" ? "zh-CN" : "en-US")}
				/>
				<Button
					type="text"
					icon={
						themeMode === "light" ? (
							<Sun size={18} style={{ color: token.colorTextTertiary }} />
						) : (
							<Moon size={18} style={{ color: token.colorTextTertiary }} />
						)
					}
					onClick={() =>
						changeThemeMode(themeMode === "light" ? "dark" : "light")
					}
				/>
			</div>
		</div>
	);
}
