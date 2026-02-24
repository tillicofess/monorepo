import { Progress, Typography, theme } from 'antd';
import { FormattedMessage } from 'react-intl';
import { formatFileSize } from '@/utils/utils';

const { useToken } = theme;

export interface FileUploadPanelProps {
  selectedFile: File | null;
  progress: number;
  uploading: boolean;
}

export function FileUploadPanel({ selectedFile, progress, uploading }: FileUploadPanelProps) {
  const { token } = useToken();

  return (
    <>
      {selectedFile && (
        <div
          style={{
            marginBottom: '8px',
            padding: '12px 16px',
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 8,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong>
            <FormattedMessage id="selectedFile" defaultMessage="已选文件" />:
          </Typography.Text>
          <Typography.Text style={{ marginLeft: 8 }}>{selectedFile.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
            ({formatFileSize(selectedFile.size)})
          </Typography.Text>
        </div>
      )}

      {uploading && (
        <div style={{ marginBottom: '8px' }}>
          <Progress percent={progress} status="active" strokeColor="#6366F1" />
          <Typography.Text
            type="secondary"
            style={{ display: 'block', marginTop: 4, fontSize: 12 }}
          >
            <FormattedMessage id="uploading" defaultMessage="上传中，请稍候..." />
          </Typography.Text>
        </div>
      )}
    </>
  );
}
