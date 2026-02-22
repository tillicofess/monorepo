'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function CopyButton({
  value,
  className,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);

      setHasCopied(true);

      // 清除旧定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [value]);

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        'z-10 h-6 w-6 hover:bg-zinc-400 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3',
        className
      )}
      onClick={handleCopy}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? <Check /> : <Copy />}
    </Button>
  );
}
