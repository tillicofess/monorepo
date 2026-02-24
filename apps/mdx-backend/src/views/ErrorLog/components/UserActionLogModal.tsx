import { Modal, Tag } from 'antd';
import { ArrowRight } from 'lucide-react';
import type React from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  actions: any[] | null;
}

const UserActionLogModal: React.FC<Props> = ({ open, onCancel, actions }) => {
  if (!actions) return null;

  return (
    <Modal open={open} title="用户操作记录" footer={null} onCancel={onCancel} width={800}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {actions.map((action, index) => {
          const isClick = action.type === 'click';
          const isRoute = action.type === 'route';

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                border: '1px solid #eee',
              }}
            >
              {/* 类型标签 + 图标 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                {isClick && <ArrowRight size={16} style={{ marginRight: 6 }} />}
                {isRoute && <ArrowRight size={16} style={{ marginRight: 6 }} />}
                <Tag color={isClick ? 'blue' : 'green'}>{action.type.toUpperCase()}</Tag>
              </div>

              {/* 操作内容 */}
              <div style={{ fontSize: 14, color: '#333', wordBreak: 'break-all', marginBottom: 4 }}>
                {isClick && (
                  <>
                    标签: <strong>{action.data.tag}</strong> &nbsp; 文本:{' '}
                    <strong>{action.data.text}</strong> &nbsp; 选择器:{' '}
                    <strong>{action.data.selector}</strong>
                  </>
                )}
                {isRoute && (
                  <>
                    URL: <strong>{action.data.url}</strong>
                  </>
                )}
              </div>

              {/* 时间 */}
              <div style={{ fontSize: 12, color: '#999' }}>时间: {action.time}</div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default UserActionLogModal;
