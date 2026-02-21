'use client';

import * as React from 'react';
import { CopyButton } from './CopyButton';

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  raw?: string;
  __rawString__?: string;
}

export default function Pre({ children, raw, __rawString__, ...props }: PreProps) {
  // Try to extract raw text content if not explicitly provided
  const rawText =
    __rawString__ ||
    raw ||
    (typeof children === 'string'
      ? children
      : React.Children.toArray(children).reduce((acc: string, child) => {
          if (typeof child === 'string') return acc + child;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (
            React.isValidElement(child) &&
            (child.props as any).children &&
            typeof (child.props as any).children === 'string'
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return acc + (child.props as any).children;
          }
          return acc; // Simple fallback, for complex trees might need deep traversal
        }, ''));

  return (
    <div className="relative group my-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
      <div className="absolute right-4 top-4 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <CopyButton value={rawText} className="bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400" />
      </div>
      <pre {...props} className="p-4 overflow-x-auto">
        {children}
      </pre>
    </div>
  );
}
