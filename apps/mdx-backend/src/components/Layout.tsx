import {
  Menu as AntMenu,
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  type MenuProps,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Server,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/providers/auth/auth';
import { useLocale } from '@/providers/LocaleContext';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>(['sub1', 'sub2']);
  const [collapsed, setCollapsed] = useState(false);
  const { lang, themeMode, changeLang, changeThemeMode } = useLocale();
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    setSelectedKey([path]);
    const parentPath = `/${path.split('/')[1]}`;
    if (parentPath && parentPath !== '/') {
      setOpenKeys((prev) => (prev.includes(parentPath) ? prev : [...prev, parentPath]));
    }
  }, [location]);

  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <LayoutDashboard size={18} />,
        label: <FormattedMessage id="dashboard" />,
      },
      {
        key: '/fileManagement',
        icon: <Folder size={18} />,
        label: <FormattedMessage id="fileManagement" />,
      },
      {
        key: 'sub1',
        icon: <FileText size={18} />,
        label: <FormattedMessage id="blogManagement" />,
        children: [
          {
            key: '/blog',
            icon: <FileText size={18} />,
            label: <FormattedMessage id="blog" />,
          },
          {
            key: '/editor',
            icon: <PenLine size={18} />,
            label: <FormattedMessage id="editor" />,
          },
        ],
      },
    ];

    if (user?.roles?.includes('admin')) {
      baseItems.push({
        key: 'sub2',
        icon: <AlertTriangle size={18} />,
        label: <FormattedMessage id="errorLog" />,
        children: [
          {
            key: '/errorLog',
            icon: <AlertTriangle size={18} />,
            label: <FormattedMessage id="errorLog" />,
          },
          {
            key: '/performanceLog',
            icon: <Activity size={18} />,
            label: <FormattedMessage id="performanceLog" />,
          },
        ],
      });
    }

    return baseItems;
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人信息',
      onClick: () => null,
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: '设置',
      onClick: () => null,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: () => logout(),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: token.colorBgContainer,
        }}
      >
        <Space direction="vertical" align="center">
          <div
            className="loading-spinner"
            style={{
              border: `4px solid ${token.colorBorderSecondary}`,
              borderTop: `4px solid ${token.colorPrimary}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <Text>加载中...</Text>
          <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
        </Space>
      </div>
    );
  }

  const toggleMenu = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const siderBg = themeMode === 'dark' ? '#1f1f1f' : '#ffffff';
  const menuBg = themeMode === 'dark' ? 'transparent' : 'transparent';
  const menuItemHoverBg =
    themeMode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)';
  const menuSelectedColor = '#6366F1';

  const menuContent = (
    <AntMenu
      theme={themeMode === 'dark' ? 'dark' : 'light'}
      mode="inline"
      items={getMenuItems()}
      selectedKeys={selectedKey}
      openKeys={openKeys}
      onOpenChange={(keys) => setOpenKeys(keys as string[])}
      onClick={({ key }) => {
        navigate(key);
        if (isMobile) setDrawerVisible(false);
      }}
      inlineCollapsed={collapsed}
      style={{
        borderRight: 0,
        background: menuBg,
      }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', flexDirection: 'row' }}>
      {/* Sider */}
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
          ></div>

          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
            style={{
              overflow: 'auto',
              flex: 1,
              position: 'fixed',
              height: 'calc(100% - 64px)',
              left: 'unset',
              insetBlockStart: '64px',
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              background: siderBg,
              transition: 'all 0.2s ease',
            }}
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            width={240}
          >
            {/* 菜单区域 */}
            <div style={{ padding: '16px 12px', paddingTop: 24 }}>{menuContent}</div>

            {/* 折叠按钮 */}
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
                color: token.colorTextSecondary,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = menuItemHoverBg;
                e.currentTarget.style.color = menuSelectedColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = token.colorTextSecondary;
              }}
            >
              {!collapsed && '收起'}
            </Button>
          </Sider>
        </>
      )}

      {/* Drawer for mobile */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                background:
                  themeMode === 'dark'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
              }}
            >
              <Server size={18} style={{ color: themeMode === 'dark' ? '#818CF8' : '#fff' }} />
              <Text
                style={{
                  margin: 0,
                  color: themeMode === 'dark' ? '#fff' : '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                MDX Backend
              </Text>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={isMobile && drawerVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        {menuContent}
      </Drawer>

      {/* Main */}
      <Layout style={{ position: 'relative' }}>
        {/* placeholder Header */}
        <Header
          style={{
            height: '64px',
            lineHeight: '64px',
            backgroundColor: 'transparent',
            zIndex: 19,
          }}
        ></Header>
        {/* True Header */}
        <Header
          style={{
            background: token.colorBgContainer,
            zIndex: 100,
            position: 'fixed',
            insetBlockStart: 0,
            insetInlineStart: 0,
            width: '100%',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: 0,
            boxShadow: themeMode === 'light' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginInline: 20,
              alignItems: 'center',
              height: '100%',
            }}
          >
            {/* 左侧：Logo + 移动端菜单按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Logo 区域 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background:
                    themeMode === 'dark'
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Server size={20} style={{ color: '#fff' }} />
                <Text
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  MDX Backend
                </Text>
              </div>

              {/* 移动端菜单按钮 */}
              {isMobile && (
                <Tooltip title="展开菜单">
                  <Button
                    type="text"
                    icon={<Menu size={20} />}
                    onClick={toggleMenu}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Tooltip>
              )}
            </div>

            {/* 右侧：功能按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* 通知铃铛 */}
              <Tooltip title="通知">
                <Button
                  type="text"
                  size="middle"
                  icon={
                    <Badge count={3} size="small" offset={[-2, 2]}>
                      <Bell size={18} />
                    </Badge>
                  }
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: token.colorTextSecondary,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = menuItemHoverBg;
                    e.currentTarget.style.color = menuSelectedColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = token.colorTextSecondary;
                  }}
                />
              </Tooltip>

              {/* 语言切换 */}
              <Tooltip title={lang === 'en-US' ? '切换到中文' : 'Switch to English'}>
                <Button
                  type="text"
                  size="middle"
                  icon={<Globe size={18} />}
                  onClick={() => changeLang(lang === 'en-US' ? 'zh-CN' : 'en-US')}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: token.colorTextSecondary,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = menuItemHoverBg;
                    e.currentTarget.style.color = menuSelectedColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = token.colorTextSecondary;
                  }}
                />
              </Tooltip>

              {/* 主题切换 */}
              <Tooltip title={themeMode === 'light' ? '切换到深色模式' : 'Switch to light mode'}>
                <Button
                  type="text"
                  size="middle"
                  icon={themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  onClick={() => changeThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: token.colorTextSecondary,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = menuItemHoverBg;
                    e.currentTarget.style.color = menuSelectedColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = token.colorTextSecondary;
                  }}
                />
              </Tooltip>

              {/* 用户信息 */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Button type="text"
                  style={{
                    cursor: 'pointer',
                    padding: '4px 12px 4px 4px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    marginLeft: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = menuItemHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Avatar
                    size={32}
                    style={{
                      backgroundColor: '#6366F1',
                      border: '2px solid rgba(99, 102, 241, 0.3)',
                    }}
                    icon={<User size={16} />}
                  />
                  <Text
                    style={{
                      fontWeight: 500,
                      color: token.colorText,
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name}
                  </Text>
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>
        {/* Content */}
        <Content
          style={{
            paddingBlock: isMobile ? 16 : 28,
            paddingInline: isMobile ? 16 : 40,
            minHeight: 280,
            background: themeMode === 'dark' ? '#141414' : '#f5f5f5',
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
