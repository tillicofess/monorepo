import { Button, Card, Typography, theme } from 'antd';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useSWR from 'swr';
import ErrorLogTable from '@/components/ErrorLogTable';
import SourceCodeModal from '@/components/modal/SourceCodeModal';
import UserActionLogModal from '@/components/modal/UserActionLogModal';
import { fetcher } from '@/lib/axios';
import { findCodeBySourceMap } from '@/utils/map';

const { Title } = Typography;
const { useToken } = theme;

const ErrorLog: React.FC = () => {
  const { token } = useToken();
  const [sourceModalData, setSourceModalData] = useState<{
    result: any;
    codeSnippet: string;
  } | null>(null);
  const [actionModalData, setActionModalData] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, mutate } = useSWR('/errorLogs/all', fetcher);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } finally {
      setTimeout(() => setRefreshing(false), 200);
    }
  };

  const handleViewSourceCode = async (completeError: any) => {
    try {
      const { result, codeSnippet } = await findCodeBySourceMap(completeError);
      setSourceModalData({ result, codeSnippet });
    } catch (error) {
      console.error('获取源码失败:', error);
    }
  };

  const handleViewActions = (actions: any[]) => {
    setActionModalData(actions);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 页面标题和操作按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle style={{ color: '#EF4444' }} />
          <FormattedMessage id="errorLogTitle" defaultMessage="错误日志" />
        </Title>
        <Button
          type="primary"
          icon={<RefreshCw size={16} className={refreshing ? 'spin' : ''} />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          <FormattedMessage id="refreshData" defaultMessage="刷新数据" />
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <ErrorLogTable
          data={data || []}
          loading={isLoading}
          onViewSourceCode={handleViewSourceCode}
          onViewActions={handleViewActions}
        />
      </Card>

      <SourceCodeModal
        open={sourceModalData !== null}
        onCancel={() => setSourceModalData(null)}
        data={sourceModalData}
      />
      <UserActionLogModal
        open={actionModalData !== null}
        onCancel={() => setActionModalData(null)}
        actions={actionModalData}
      />

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ErrorLog;
