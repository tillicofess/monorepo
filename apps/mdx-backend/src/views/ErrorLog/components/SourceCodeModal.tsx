import { Modal } from 'antd';
import type React from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  data: { result: any; codeSnippet: string } | null;
}

const SourceCodeModal: React.FC<Props> = ({ open, onCancel, data }) => {
  if (!data) return null;

  const startLine = data.result.line - 10;

  return (
    <Modal open={open} title="查看源码" footer={null} onCancel={onCancel} width={800}>
      <p>
        <strong>文件:</strong> {data.result.source}
      </p>
      <p>
        <strong>位置:</strong> 第 {data.result.line} 行，第 {data.result.column} 列
      </p>
      <div
        style={{
          background: '#f6f6f6',
          padding: '10px',
          overflowX: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {data.codeSnippet.split('\n').map((line, i) => {
          const currentLine = startLine + i;
          const isError = currentLine === data.result.line;
          return (
            <div
              key={i}
              style={{
                backgroundColor: isError ? '#ffecec' : undefined,
                color: isError ? '#d32f2f' : undefined,
                fontWeight: isError ? 'bold' : undefined,
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              <span style={{ color: '#999', marginRight: 10 }}>
                {String(currentLine).padStart(4, ' ')}:
              </span>
              {line}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default SourceCodeModal;
