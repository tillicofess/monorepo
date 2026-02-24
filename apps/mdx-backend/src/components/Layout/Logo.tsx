import { Typography, theme } from 'antd';
import { Server } from 'lucide-react';

const { Text } = Typography;

interface LogoProps {
  collapsed?: boolean;
  themeMode: 'light' | 'dark';
}

export function Logo({ collapsed, themeMode }: LogoProps) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '6px 10px' : '8px 14px',
        borderRadius: collapsed ? 8 : 10,
        background:
          themeMode === 'dark'
            ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryBg} 100%)`
            : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        transition: 'all 0.2s ease',
      }}
    >
      <Server size={collapsed ? 18 : 20} style={{ color: token.colorBgContainer }} />
      {!collapsed && (
        <Text
          style={{
            margin: 0,
            color: token.colorBgContainer,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          MDX Backend
        </Text>
      )}
    </div>
  );
}
