import { Layout as AntLayout, theme } from "antd";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useAuth } from "@/providers/auth/auth";
import { useLocale } from "@/providers/LocaleContext";
import { Header, Loading, SiderContent } from "./Layout/index";

const { Sider, Content } = AntLayout;

const AppLayout = () => {
	const { isAuthenticated } = useAuth();
	const { token } = theme.useToken();
	const [collapsed, setCollapsed] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const { themeMode } = useLocale();

	useEffect(() => {
		const checkScreen = () => {
			setIsSmallScreen(window.innerWidth < 1200);
		};
		checkScreen();
		window.addEventListener("resize", checkScreen);
		return () => window.removeEventListener("resize", checkScreen);
	}, []);

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
				<SiderContent collapsed={collapsed} setCollapsed={setCollapsed} />
			</Sider>

			<AntLayout
				style={{
					marginInlineStart: isSmallScreen ? 0 : collapsed ? 80 : 256,
					background: token.colorBgLayout,
				}}
			>
				<Content
					style={{
						display: "flex",
						flexDirection: "column",
						margin: isSmallScreen ? "16px 12px 0" : "32px 24px 0",
						gap: 24,
					}}
				>
					{isSmallScreen && <Header />}
					<Outlet />
				</Content>
			</AntLayout>
		</AntLayout>
	);
};

export default AppLayout;
