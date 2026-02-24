import { Space, Typography, theme } from 'antd';

const { Text } = Typography;

interface LoadingProps {
  background?: string;
}

export function Loading({ background }: LoadingProps) {
  const { token } = theme.useToken();
  const bg = background ?? token.colorBgLayout;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: bg,
      }}
    >
      <Space direction="vertical" align="center">
        <div
          className="loading-spinner"
          style={{
            border: `4px solid ${token.colorPrimaryBg}`,
            borderTop: `4px solid ${token.colorPrimary}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <Text style={{ color: token.colorText }}>加载中...</Text>
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
