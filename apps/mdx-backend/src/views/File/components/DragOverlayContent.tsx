import { FileOutlined, FolderOpenOutlined } from '@ant-design/icons';
import type { FileItem } from '../types';

export interface DragOverlayContentProps {
  activeItem: FileItem | null;
}

export function DragOverlayContent({ activeItem }: DragOverlayContentProps) {
  if (!activeItem) {
    return null;
  }

  return (
    <div
      style={{
        width: 180,
        padding: '8px 16px',
        backgroundColor: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.95,
        cursor: 'grabbing',
      }}
    >
      {activeItem.isDir ? <FolderOpenOutlined style={{ color: '#6366F1' }} /> : <FileOutlined />}
      <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {activeItem.name}
      </span>
    </div>
  );
}
