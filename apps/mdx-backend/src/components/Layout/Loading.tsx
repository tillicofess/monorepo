import { Space, Typography } from 'antd';

const { Text } = Typography;

interface LoadingProps {
  background?: string;
}

export function Loading({ background }: LoadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: background,
      }}
    >
      <Space direction="vertical" align="center">
        <div
          className="loading-spinner"
          style={{
            border: '4px solid rgba(99, 102, 241, 0.2)',
            borderTop: '4px solid #6366F1',
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
