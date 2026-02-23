import { Button, Dropdown, Menu } from 'antd';
import React from 'react';
import { FolderDroppable } from '@/components/DroppableNode.tsx';

// 定义面包屑项的类型
interface BreadcrumbItem {
  id: string | null;
  name: string | React.ReactNode;
}

// 定义封装组件的Props
interface EllipsisBreadcrumbProps {
  items: BreadcrumbItem[]; // 原始路径数组
  onItemClick: (index: number) => void; // 点击面包屑项时的回调函数
  maxDisplayCount?: number; // 可选：最大显示的项数，默认为 3
}

/**
 * 封装的 EllipsisBreadcrumb 组件
 * 当项目数超过 maxDisplayCount 时，将中间的项收起到下拉菜单中。
 */
export default function EllipsisBreadcrumb({
  items,
  onItemClick,
  maxDisplayCount = 2,
}: EllipsisBreadcrumbProps) {
  if (items.length <= maxDisplayCount) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1; // ⭐ 判断是否为最后一项
          const titleContent = (
            <Button
              type="text"
              style={{ cursor: isLast ? 'default' : 'pointer', fontSize: 16, fontWeight: 600 }}
              onClick={() => !isLast && onItemClick(index)}
            >
              {item.name}
            </Button>
          );

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: '0 8px', color: '#bfbfbf' }}>/</span>}
              {isLast ? (
                titleContent // ⭐ 最后一项不包裹 FolderDroppable
              ) : (
                <FolderDroppable folder={item}>{titleContent}</FolderDroppable>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  } else {
    const collapsedItems = items.slice(0, items.length - maxDisplayCount);
    const visibleItems = items.slice(items.length - maxDisplayCount);

    const dropdownMenuItems = collapsedItems.map((item, index) => ({
      key: String(index),
      label: (
        <FolderDroppable folder={item}>
          <Button type="text" onClick={() => onItemClick(index)} style={{ cursor: 'pointer' }}>
            {item.name}
          </Button>
        </FolderDroppable>
      ),
    }));

    const menu = <Menu items={dropdownMenuItems} />;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Dropdown overlay={menu}>
          <span style={{ cursor: 'pointer', marginRight: '8px' }}>···</span>
        </Dropdown>
        <span style={{ color: '#bfbfbf' }}>/</span>

        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1; // ⭐ 判断是否为最后一项
          const originalIndex = collapsedItems.length + index;

          const titleContent = (
            <Button
              type="text"
              style={{ cursor: isLast ? 'default' : 'pointer' }}
              onClick={() => !isLast && onItemClick(originalIndex)}
            >
              {item.name}
            </Button>
          );

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: '0 8px', color: '#bfbfbf' }}>/</span>}
              {isLast ? (
                titleContent // ⭐ 最后一项不包裹 FolderDroppable
              ) : (
                <FolderDroppable folder={item}>{titleContent}</FolderDroppable>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}
