import { Menu as AntMenu } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import { Activity, AlertTriangle, Folder, LayoutDashboard } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { useAuth } from '@/providers/auth/auth';

interface SidebarProps {
  selectedKey: string[];
  openKeys: string[];
  collapsed: boolean;
  themeMode: 'light' | 'dark';
  onOpenChange: (keys: string[]) => void;
  onMenuClick: (key: string) => void;
}

export function Sidebar({
  selectedKey,
  openKeys,
  collapsed,
  themeMode,
  onOpenChange,
  onMenuClick,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getMenuItems = (): ItemType[] => {
    const baseItems: ItemType[] = [
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

  return (
    <AntMenu
      theme={themeMode === 'dark' ? 'dark' : 'light'}
      mode="inline"
      items={getMenuItems()}
      selectedKeys={selectedKey}
      openKeys={openKeys}
      onOpenChange={(keys) => onOpenChange(keys as string[])}
      onClick={({ key }) => {
        navigate(key);
        onMenuClick(key);
      }}
      inlineCollapsed={collapsed}
      style={{
        borderRight: 0,
        background: 'transparent',
      }}
    />
  );
}
