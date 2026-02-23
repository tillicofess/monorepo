import { useDroppable } from '@dnd-kit/core';

// 通用的Droppable Props类型
interface DroppableProps {
  folder: any;
  children: React.ReactNode;
}

/**
 * 用于面包屑的FolderDroppable组件
 * 使用inline-flex布局，适合面包屑的行内元素场景
 */
export const FolderDroppable = ({ folder, children }: DroppableProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* ---- Invisible Larger Drop Zone ---- */}
      <span
        ref={setNodeRef}
        style={{
          position: 'absolute',
          inset: '-6px -4px', // ⭐ 扩大点击/拖拽区域
          border: isOver ? '2px solid #1677ff' : '2px solid transparent',
          backgroundColor: isOver ? 'rgba(22, 119, 255, 0.1)' : 'transparent',
          transition: 'all 0.1s ease',
          borderRadius: 6,
          pointerEvents: 'none', // ⭐ 不影响点击，只给 DnD 用
        }}
      />

      {/* ---- Actual Content ---- */}
      {children}
    </span>
  );
};

/**
 * 用于表格列的TableFolderDroppable组件
 * 使用flex布局，适合表格单元格的场景
 */
export const TableFolderDroppable = ({ folder, children }: DroppableProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* ---- Invisible Larger Drop Zone ---- */}
      <div
        ref={setNodeRef}
        style={{
          position: 'absolute',
          inset: '-6px -4px', // ⭐ 扩大点击/拖拽区域
          border: isOver ? '2px solid #1677ff' : '2px solid transparent',
          backgroundColor: isOver ? 'rgba(22, 119, 255, 0.1)' : 'transparent',
          transition: 'all 0.1s ease',
          borderRadius: 6,
          pointerEvents: 'none', // ⭐ 不影响点击，只给 DnD 用
        }}
      />

      {/* ---- Actual Content ---- */}
      {children}
    </div>
  );
};
