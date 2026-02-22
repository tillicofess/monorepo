import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="max-w-screen overflow-x-hidden px-2">
      <div className="screen-line-before mx-auto border-x border-edge pt-4 md:max-w-3xl">
        <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 text-center">
          © {new Date().getFullYear()}
        </p>

        <div className="screen-line-before screen-line-after flex w-full before:z-1 after:z-1 justify-center align-center">
          <div className="mx-auto flex items-center justify-center gap-3 bg-background px-4">
            <Separator />

            <a
              className="flex items-center text-muted-foreground transition-[color] hover:text-foreground"
              href="https://github.com/tillicofess"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.github className="size-4" />
              <span className="sr-only">GitHub</span>
            </a>

            <Separator />
          </div>
        </div>
      </div>
      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex h-2" />
      </div>
    </footer>
  );
}

function Separator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex h-11 w-px bg-edge', className)} {...props} />;
}
