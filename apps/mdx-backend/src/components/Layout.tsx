import { Button, Drawer, Layout, theme } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuth } from "@/providers/auth/auth";
import { useLocale } from "@/providers/LocaleContext";
import { Header, Loading, Logo, Sidebar } from "./Layout/index";

const { Sider, Content, Header: AntHeader } = Layout;

const AppLayout = () => {
	const location = useLocation();
	const { isAuthenticated } = useAuth();
	const { themeMode } = useLocale();
	const { token } = theme.useToken();
	const [selectedKey, setSelectedKey] = useState<string[]>([]);
	const [openKeys, setOpenKeys] = useState<string[]>(["sub2"]);
	const [collapsed, setCollapsed] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

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

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 576);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleOpenChange = (keys: string[]) => {
		setOpenKeys(keys);
	};

	const handleMenuClick = () => {
		if (isMobile) setDrawerVisible(false);
	};

	const toggleMenu = () => {
		if (isMobile) {
			setDrawerVisible(!drawerVisible);
		} else {
			setCollapsed(!collapsed);
		}
	};

	const siderBg = token.colorBgContainer;

	if (!isAuthenticated) {
		return <Loading background={token.colorBgLayout} />;
	}

	return (
		<Layout style={{ minHeight: "100vh", flexDirection: "row" }}>
			{!isMobile && (
				<Sider
					trigger={null}
					collapsible
					collapsed={collapsed}
					breakpoint="md"
					onBreakpoint={(broken) => setCollapsed(broken)}
					style={{
						overflow: "auto",
						flex: 1,
						position: "fixed",
						height: "calc(100% - 64px)",
						left: "unset",
						insetBlockStart: "64px",
						borderRight: `1px solid ${token.colorBorder}`,
						background: siderBg,
						transition: "all 0.2s ease",
					}}
					theme={themeMode === "dark" ? "dark" : "light"}
					width={240}
				>
					<div style={{ padding: "16px 12px", paddingTop: 24 }}>
						<Sidebar
							selectedKey={selectedKey}
							openKeys={openKeys}
							collapsed={collapsed}
							themeMode={themeMode}
							onOpenChange={handleOpenChange}
							onMenuClick={handleMenuClick}
						/>
					</div>
					<Button
						type="text"
						icon={
							collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
						}
						onClick={() => setCollapsed(!collapsed)}
						style={{
							fontSize: 14,
							width: "calc(100% - 24px)",
							height: 40,
							position: "absolute",
							bottom: 16,
							left: 12,
							borderRadius: 8,
							display: "flex",
							alignItems: "center",
							justifyContent: collapsed ? "center" : "flex-start",
							gap: 8,
							paddingLeft: collapsed ? 0 : 12,
						}}
					>
						{!collapsed && "收起"}
					</Button>
				</Sider>
			)}

			<Drawer
				title={null}
				placement="left"
				onClose={() => setDrawerVisible(false)}
				open={isMobile && drawerVisible}
				width={280}
				styles={{
					header: { padding: 0 },
					body: { padding: 0 },
				}}
			>
				<div style={{ padding: "16px 12px", paddingTop: 24 }}>
					<Logo collapsed={false} themeMode={themeMode} />
				</div>
				<Sidebar
					selectedKey={selectedKey}
					openKeys={openKeys}
					collapsed={collapsed}
					themeMode={themeMode}
					onOpenChange={handleOpenChange}
					onMenuClick={handleMenuClick}
				/>
			</Drawer>

			<Layout
				style={{
					position: "relative",
					marginInlineStart: isMobile ? 0 : collapsed ? 80 : 240,
					transition: "margin-inline-start 0.2s ease",
				}}
			>
				<AntHeader
					style={{
						height: "64px",
						lineHeight: "64px",
						backgroundColor: "transparent",
						zIndex: 19,
					}}
				/>
				<AntHeader
					style={{
						background: token.colorBgContainer,
						zIndex: 100,
						position: "fixed",
						insetBlockStart: 0,
						insetInlineStart: 0,
						width: "100%",
						borderBottom: `1px solid ${token.colorBorder}`,
						padding: 0,
						boxShadow:
							themeMode === "light"
								? `0 1px 4px ${token.colorBorderSecondary}`
								: "none",
						transition: "all 0.2s ease",
					}}
				>
					<Header isMobile={isMobile} onToggleMenu={toggleMenu} />
				</AntHeader>
				<Content
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						paddingBlock: isMobile ? 12 : 28,
						paddingInline: isMobile ? 12 : 40,
						minHeight: 280,
						background: token.colorBgLayout,
						transition: "all 0.2s ease",
					}}
				>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
};

export default AppLayout;
