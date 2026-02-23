import type { TableProps } from 'antd';
import { Button, Table } from 'antd';
import { Code, Play } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import type { DataType } from '@/types/log/errorLogType';
import { throttle } from '@/utils/throttle';

interface ErrorLogTableProps {
  data: DataType[];
  loading: boolean;
  onViewSourceCode: (completeError: any) => void;
  onViewActions: (actions: any[]) => void;
}

const ErrorLogTable: React.FC<ErrorLogTableProps> = ({
  data,
  loading,
  onViewSourceCode,
  onViewActions,
}) => {
  const handleViewSourceCode = useCallback(
    throttle((completeError: any) => {
      onViewSourceCode(completeError);
    }, 500),
    [onViewSourceCode],
  );

  const handleViewActions = useCallback(
    throttle((actions: any[]) => {
      onViewActions(actions);
    }, 500),
    [onViewActions],
  );

  const columns: TableProps<DataType>['columns'] = [
    {
      title: <FormattedMessage id="errorMessage" defaultMessage="错误信息" />,
      dataIndex: 'error',
      key: 'error',
      render: (text) => <span>{text?.message}</span>,
    },
    {
      title: <FormattedMessage id="errorType" defaultMessage="错误类型" />,
      dataIndex: 'error',
      key: 'sub_type',
      render: (text) => <span>{text?.category}</span>,
    },
    {
      title: <FormattedMessage id="errorTime" defaultMessage="错误时间" />,
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: <FormattedMessage id="version" defaultMessage="版本" />,
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: <FormattedMessage id="viewSourceCode" defaultMessage="源码" />,
      key: 'code',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const error = record.error;
        const version = record.version;
        const hasSourceInfo =
          error?.fileName && error?.line !== undefined && error?.column !== undefined;

        if (!hasSourceInfo) return null;

        return (
          <Button
            type="primary"
            size="small"
            icon={<Code size={14} />}
            onClick={() =>
              handleViewSourceCode({
                message: error.message,
                fileName: error.fileName,
                line: error.line,
                column: error.column,
                version,
              })
            }
          >
            源码
          </Button>
        );
      },
    },
    {
      title: <FormattedMessage id="userOperationRecords" defaultMessage="操作记录" />,
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      align: 'center',
      render: (_, { actions }) =>
        actions?.length > 0 ? (
          <Button
            type="primary"
            size="small"
            icon={<Play size={14} />}
            onClick={() => handleViewActions(actions)}
          >
            查看
          </Button>
        ) : null,
    },
    {
      title: <FormattedMessage id="count" defaultMessage="次数" />,
      dataIndex: 'count',
      key: 'count',
      width: 100,
      align: 'center',
    },
  ];

  return (
    <Table<DataType>
      columns={columns}
      dataSource={data}
      loading={loading}
      style={{ borderRadius: '12px', overflow: 'hidden' }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '50'],
      }}
    />
  );
};

export default ErrorLogTable;
