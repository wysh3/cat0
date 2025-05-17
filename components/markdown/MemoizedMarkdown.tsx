'use client';
import React, { memo, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { marked } from 'marked';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ComponentProps } from 'react';
import type { ExtraProps } from 'react-markdown';

type CodeComponentProps = ComponentProps<'code'> & ExtraProps;

const components: Partial<Components> = {
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
};

function CodeBlock({
  children,
  className,
  node,
  ...props
}: CodeComponentProps) {
  const match = /language-(\w+)/.exec(className || '');

  if (match) {
    const lang = match[1];
    return (
      <div>
        <Codebar lang={lang} codeString={String(children)} />
        <SyntaxHighlighter
          style={oneDark}
          language={lang}
          PreTag="pre"
          customStyle={{
            margin: '0px',
            background: 'rgba(138, 121, 171, 0.1)',
            borderRadius: '0',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'Geist Mono',
              fontSize: '14px',
            },
          }}
        >
          {String(children)}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      className="mx-0.5 overflow-auto rounded-md px-2 py-1 bg-primary/10 text-foreground font-mono"
      {...props}
    >
      {children}
    </code>
  );
}

function Codebar({ lang, codeString }: { lang: string; codeString: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code to clipboard:', error);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-secondary text-foreground rounded-t-md">
      <span className="text-sm font-mono">{lang}</span>
      <button onClick={copyToClipboard} className="text-sm">
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  try {
    const tokens = marked.lexer(markdown);
    return tokens.map((token) => token.raw);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return [markdown];
  }
}

function PureMarkdownRendererBlock({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

const MarkdownRendererBlock = memo(
  PureMarkdownRendererBlock,
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  }
);

MarkdownRendererBlock.displayName = 'MarkdownRendererBlock';

const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);
    return (
      <div className="prose prose-base dark:prose-invert break-words max-w-3xl prose-code:before:content-none prose-code:after:content-none">
        {blocks.map((block, index) => (
          <MarkdownRendererBlock content={block} key={`${id}-block-${index}`} />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default MemoizedMarkdown;
