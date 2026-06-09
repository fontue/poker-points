import type { ReactNode } from 'react';

type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

type MarkdownContentProps = {
  content: string;
};

function parseMarkdown(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.split('\n');
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push({ type: 'list', items: listItems });
    listItems = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      blocks.push({ type: 'heading', level: 3, text: line.slice(4) });
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      blocks.push({ type: 'heading', level: 2, text: line.slice(3) });
      return;
    }

    if (line.startsWith('* ')) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    blocks.push({ type: 'paragraph', text: line });
  });

  flushList();
  return blocks;
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
  if (block.type === 'heading') {
    const className =
      block.level === 2
        ? 'mt-5 first:mt-0 text-base font-black text-white'
        : 'mt-4 first:mt-0 text-sm font-black text-zinc-100';

    return (
      <h3 key={index} className={className}>
        {block.text}
      </h3>
    );
  }

  if (block.type === 'list') {
    return (
      <ul key={index} className="my-3 space-y-2 pl-4 text-sm leading-6 text-zinc-300">
        {block.items.map((item) => (
          <li key={item} className="list-disc pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className="my-3 text-sm leading-6 text-zinc-300">
      {block.text}
    </p>
  );
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return <div className="text-left">{parseMarkdown(content).map(renderBlock)}</div>;
}
