import { useDraggable } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { createContext, useMemo } from 'react';

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap | undefined;
}

export const RowContext = createContext<RowContextProps>({});

const DraggableRow = (props: any) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props['data-row-key'], // 文件或文件夹 id
  });

  const style = {
    ...props.style,
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setNodeRef, listeners }),
    [setNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export default DraggableRow;
