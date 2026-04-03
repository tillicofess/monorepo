import { Layout as AntLayout, Button, theme } from "antd";
import { Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuth } from "@/providers/auth/auth";
import { useLocale } from "@/providers/LocaleContext";
import { Loading, Logo, Sidebar, UserMenu } from "./Layout/index";

const { Sider, Content } = AntLayout;

const AppLayout = () => {
	const location = useLocation();
	const { isAuthenticated, user, logout } = useAuth();
	const { token } = theme.useToken();
	const [selectedKey, setSelectedKey] = useState<string[]>([]);
	const [openKeys, setOpenKeys] = useState<string[]>(["sub2"]);
	const [collapsed] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const { lang, themeMode, changeLang, changeThemeMode } = useLocale();

	useEffect(() => {
		const checkScreen = () => {
			setIsSmallScreen(window.innerWidth < 1280);
		};
		checkScreen();
		window.addEventListener("resize", checkScreen);
		return () => window.removeEventListener("resize", checkScreen);
	}, []);

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

	if (!isAuthenticated) {
		return <Loading background={token.colorBgLayout} />;
	}

	return (
		<AntLayout style={{ minHeight: "100vh" }}>
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				style={{
					overflow: "auto",
					height: "100vh",
					position: "fixed",
					left: 0,
					top: 0,
					bottom: 0,
					borderRight: `1px solid ${token.colorBorderSecondary}`,
					background: token.colorBgContainer,
				}}
				theme={themeMode === "dark" ? "dark" : "light"}
				width={256}
				hidden={isSmallScreen}
			>
				<div
					style={{ display: "flex", flexDirection: "column", height: "100%" }}
				>
					{/* 1. 顶部 Logo 区域 */}
					<div style={{ padding: "20px 10px 20px 10px" }}>
						<Logo collapsed={collapsed} themeMode={themeMode} />
					</div>

					{/* 2. 用户选择器 */}
					<div style={{ padding: "0 16px 16px 16px" }}>
						<UserMenu userName={user?.name ?? "admin"} onLogout={logout} />
					</div>

					{/* 3. 导航菜单区域 */}
					<div style={{ flex: 1, overflow: "auto", padding: "0 8px" }}>
						<Sidebar
							selectedKey={selectedKey}
							openKeys={openKeys}
							collapsed={collapsed}
							themeMode={themeMode}
							onOpenChange={handleOpenChange}
							onMenuClick={() => {}}
						/>
					</div>

					{/* 4. 底部工具栏 (仅保留切换按钮) */}
					<div
						style={{
							padding: "16px",
							display: "flex",
							alignItems: "center",
							gap: "16px",
						}}
					>
						<Button
							type="text"
							icon={
								<Globe size={18} style={{ color: token.colorTextTertiary }} />
							}
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
			</Sider>

			<AntLayout
				style={{
					marginInlineStart: isSmallScreen ? 0 : collapsed ? 80 : 256,
					background: token.colorBgLayout,
				}}
			>
				<Content>
					<Outlet />
				</Content>
			</AntLayout>
		</AntLayout>
	);
};

export default AppLayout;
