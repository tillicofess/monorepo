import { Avatar, Button, Dropdown, type MenuProps } from 'antd';
import { LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
  userName?: string;
  onLogout: () => void;
}

export function UserMenu({ userName, onLogout }: UserMenuProps) {
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
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: userMenuItems }}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Button
        type="text"
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
      >
        <Avatar
          size={32}
          style={{
            backgroundColor: '#6366F1',
            border: '2px solid rgba(99, 102, 241, 0.3)',
          }}
          icon={<User size={16} />}
        />
        <span
          style={{
            fontWeight: 500,
            maxWidth: 100,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {userName}
        </span>
      </Button>
    </Dropdown>
  );
}
