import { FileOutlined, FolderOpenOutlined, HolderOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Button, Space, Table } from 'antd';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { downloadFile } from '@/apis/index';
import DraggableRow from '@/components/DraggableRow';
import { RowContext } from '@/components/DraggableRow.tsx';
import { TableFolderDroppable } from '@/components/DroppableNode.tsx';
import { formatFileSize } from '@/utils/utils';
import type { FileItem } from '../types';
import { useAbility } from '@/providers/AbilityProvider';


export interface FileTableProps {
  fileList: FileItem[] | undefined;
  isLoading: boolean;
  onEnterFolder: (record: FileItem) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, name: string, isDir: boolean) => void;
}

const DragHandle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <span
      ref={setActivatorNodeRef}
      {...listeners}
      style={{ cursor: 'grab', display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
    </span>
  );
};

export function FileTable({
  fileList,
  isLoading,
  onEnterFolder,
  onRename,
  onDelete,
}: FileTableProps) {
  const ability = useAbility();
  const columns: TableColumnsType<FileItem> = [
    {
      title: <FormattedMessage id="fileName" defaultMessage="File Name" />,
      dataIndex: 'name',
      key: 'name',
      minWidth: 240,
      ellipsis: true,
      render: (text: string, record: FileItem) => {
        const isDir = record.isDir;

        const content = (
          <Space>
            <DragHandle>
              <HolderOutlined />
            </DragHandle>

            {isDir ? <FolderOpenOutlined style={{ color: '#6366F1' }} /> : <FileOutlined />}

            {text}
          </Space>
        );

        return isDir ? (
          <TableFolderDroppable folder={record}>{content}</TableFolderDroppable>
        ) : (
          content
        );
      },
      filters: [
        { text: 'Folders', value: 1 },
        { text: 'Files', value: 0 },
      ],
      onFilter: (value, record) => record.isDir === value,
    },
    {
      title: <FormattedMessage id="fileSize" defaultMessage="File Size" />,
      dataIndex: 'size',
      key: 'size',
      width: 180,
      render: (size: number, record: FileItem) => (record.isDir ? '-' : formatFileSize(size)),
      sorter: (a: FileItem, b: FileItem) => a.size - b.size,
    },
    {
      title: <FormattedMessage id="uploadDate" defaultMessage="Upload Date" />,
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
      render: (uploadTime: string) => {
        return new Date(uploadTime).toLocaleString();
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 240,
      render: (record: FileItem) => (
        <Space size="middle">
          <Button type="text" size="small" onClick={() => onRename(record.id, record.name)}>
            重命名
          </Button>
          <Button
            type="text"
            size="small"
            danger
            onClick={() => onDelete(record.id, record.name, record.isDir)}
            disabled={!ability.can('delete', 'editor')}
          >
            删除
          </Button>
          {!record.isDir && (
            <Button type="link" size="small" onClick={() => downloadFile(record.id)}>
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      size="middle"
      scroll={{ y: 640 }}
      rowKey={(record) => record.id}
      columns={columns}
      loading={isLoading}
      dataSource={fileList as FileItem[]}
      pagination={false}
      onRow={(record) => {
        return {
          onDoubleClick: () => onEnterFolder(record),
          style: { cursor: record.isDir ? 'pointer' : 'default' },
        };
      }}
      components={{
        body: {
          row: DraggableRow,
        },
      }}
    />
  );
}
