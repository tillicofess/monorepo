import { Button, Drawer, Layout, theme } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '@/providers/auth/auth';
import { useLocale } from '@/providers/LocaleContext';
import { Header, Loading, Sidebar } from './Layout/index';

const { Sider, Content, Header: AntHeader } = Layout;

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { lang, themeMode, changeLang, changeThemeMode } = useLocale();
  const { token } = theme.useToken();
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>(['sub2']);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    setSelectedKey([path]);
    const parentPath = `/${path.split('/')[1]}`;
    if (parentPath && parentPath !== '/') {
      setOpenKeys((prev) => (prev.includes(parentPath) ? prev : [...prev, parentPath]));
    }
  }, [location]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    <Layout style={{ minHeight: '100vh', flexDirection: 'row' }}>
      {!isMobile && (
        <>
          <div
            style={{
              width: collapsed ? '80px' : '240px',
              overflow: 'hidden',
              flex: collapsed ? '0 0 80px' : '0 0 240px',
              maxWidth: collapsed ? '80px' : '240px',
              minWidth: collapsed ? '80px' : '240px',
              transition: 'all 0.2s ease',
            }}
          />
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            onBreakpoint={(broken) => setCollapsed(broken)}
            style={{
              overflow: 'auto',
              flex: 1,
              position: 'fixed',
              height: 'calc(100% - 64px)',
              left: 'unset',
              insetBlockStart: '64px',
              borderRight: `1px solid ${token.colorBorder}`,
              background: siderBg,
              transition: 'all 0.2s ease',
            }}
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            width={240}
          >
            <div style={{ padding: '16px 12px', paddingTop: 24 }}>
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
              icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 14,
                width: 'calc(100% - 24px)',
                height: 40,
                position: 'absolute',
                bottom: 16,
                left: 12,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                paddingLeft: collapsed ? 0 : 12,
              }}
            >
              {!collapsed && '收起'}
            </Button>
          </Sider>
        </>
      )}

      <Drawer
        title={null}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={isMobile && drawerVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar
          selectedKey={selectedKey}
          openKeys={openKeys}
          collapsed={collapsed}
          themeMode={themeMode}
          onOpenChange={handleOpenChange}
          onMenuClick={handleMenuClick}
        />
      </Drawer>

      <Layout style={{ position: 'relative' }}>
        <AntHeader
          style={{
            height: '64px',
            lineHeight: '64px',
            backgroundColor: 'transparent',
            zIndex: 19,
          }}
        />
        <AntHeader
          style={{
            background: token.colorBgContainer,
            zIndex: 100,
            position: 'fixed',
            insetBlockStart: 0,
            insetInlineStart: 0,
            width: '100%',
            borderBottom: `1px solid ${token.colorBorder}`,
            padding: 0,
            boxShadow: themeMode === 'light' ? `0 1px 4px ${token.colorBorderSecondary}` : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Header
            themeMode={themeMode}
            isMobile={isMobile}
            lang={lang}
            userName={user?.name}
            notificationCount={3}
            onToggleMenu={toggleMenu}
            onChangeLang={changeLang}
            onChangeThemeMode={changeThemeMode}
            onLogout={logout}
          />
        </AntHeader>
        <Content
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBlock: isMobile ? 16 : 28,
            paddingInline: isMobile ? 16 : 40,
            minHeight: 280,
            background: token.colorBgLayout,
            transition: 'all 0.2s ease',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
