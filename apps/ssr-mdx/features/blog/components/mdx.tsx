import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import rehypeExternalLinks from 'rehype-external-links';
import type { LineElement } from 'rehype-pretty-code';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import codeImport from 'remark-code-import';
import remarkGfm from 'remark-gfm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Heading } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { NpmCommands } from "@/types/unist"
import Sandpack from './Sandpack';
import { visit } from "unist-util-visit"
import { CopyButton } from './copy-button';
import { rehypeNpmCommand } from '@/lib/rehype-npm-command';
import { CodeBlockCommand } from './code-block-command';

const components: MDXRemoteProps['components'] = {
  h1: (props: React.ComponentProps<'h1'>) => <Heading as="h1" {...props} />,
  h2: (props: React.ComponentProps<'h2'>) => <Heading as="h2" {...props} />,
  h3: (props: React.ComponentProps<'h3'>) => <Heading as="h3" {...props} />,
  h4: (props: React.ComponentProps<'h4'>) => <Heading as="h4" {...props} />,
  h5: (props: React.ComponentProps<'h5'>) => <Heading as="h5" {...props} />,
  h6: (props: React.ComponentProps<'h6'>) => <Heading as="h6" {...props} />,
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  figure({ className, ...props }: React.ComponentProps<'figure'>) {
    const hasPrettyCode = 'data-rehype-pretty-code-figure' in props;

    return <figure className={cn(hasPrettyCode && 'not-prose', className)} {...props} />;
  },
  figcaption: ({ children, ...props }: React.ComponentProps<'figcaption'>) => {
    const hasCodeTitle = 'data-rehype-pretty-code-title' in props;

    return (
      <figcaption {...props}>
        {hasCodeTitle ? <p className="truncate">{children}</p> : children}
      </figcaption>
    );
  },
  pre({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __withMeta__,
    __rawString__,

    __pnpm__,
    __yarn__,
    __npm__,
    __bun__,

    ...props
  }: React.ComponentProps<"pre"> & {
    __withMeta__?: boolean
    __rawString__?: string
  } & NpmCommands) {
    const isNpmCommand = __pnpm__ && __yarn__ && __npm__ && __bun__

    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __pnpm__={__pnpm__}
          __yarn__={__yarn__}
          __npm__={__npm__}
          __bun__={__bun__}
        />
      )
    }

    return (
      <>
        <pre {...props} />

        {__rawString__ && (
          <CopyButton
            className="absolute top-2 right-2 z-10"
            value={__rawString__}
          />
        )}
      </>
    )
  },
  code: Code,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Sandpack
};

const options: NonNullable<MDXRemoteProps['options']> = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, codeImport],
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: 'nofollow noopener noreferrer' }],
      rehypeSlug,
      () => (tree) => {
        visit(tree, (node) => {
          // is this process node.__rawString is not exist
          if (node?.type === "element" && node?.tagName === "pre") {
            // console.log('in the first process node:', node)
            const [codeEl] = node.children
            if (codeEl.tagName !== "code") {
              return
            }

            node.__rawString__ = codeEl.children?.[0].value
          }
        })
      },
      [
        rehypePrettyCode,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
          keepBackground: false,
          onVisitLine(node: LineElement) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
        },
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "figure") {
            if (!("data-rehype-pretty-code-figure" in node.properties)) {
              return
            }
            // through snapshot we can see the figure element has __rawString__ property
            // console.log(JSON.parse(JSON.stringify(node)))
            const preElement = node.children.at(-1)
            if (preElement.tagName !== "pre") {
              return
            }

            preElement.properties["__withMeta__"] = node.children.at(0).tagName === "figcaption"
            preElement.properties["__rawString__"] = node.__rawString__
            // in this way we can see the pre element has __rawString__ property in the second process
            // console.log('in the second process node:', preElement)
          }
        })
      },
      // traversal pre replaces attributes according to __rawString__
      rehypeNpmCommand
    ],
  },
};

export function MDX({ code }: { code: string }) {
  return <MDXRemote source={code} components={components} options={options} />;
}
