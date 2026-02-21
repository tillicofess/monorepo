'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import type React from 'react';

export default function SandpackWrapper(props: React.ComponentProps<typeof Sandpack>) {
  return (
    <div className="my-8">
      <Sandpack
        {...props}
        theme="dark"
        options={{
          showNavigator: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 400,
          ...props.options,
        }}
      />
    </div>
  );
}
