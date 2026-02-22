'use client';

import * as React from 'react';
import { CopyButton } from './copy-button';

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
    <>
      <CopyButton value={rawText} className="absolute top-2 right-2" />
      <pre {...props}>{children}</pre>
    </>
  );
}
