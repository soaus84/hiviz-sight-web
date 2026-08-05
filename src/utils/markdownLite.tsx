import type { ReactNode } from 'react';

// Deliberately tiny — only the four constructs MarkdownEditor's toolbar can
// produce (bold, italic, bullet list, numbered list). Not a general markdown
// parser: no links, headings, code, tables, or raw HTML, so there's nothing
// here that needs sanitizing.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<strong key={`${keyPrefix}-${i++}`}>{m[1]}</strong>);
    else nodes.push(<em key={`${keyPrefix}-${i++}`}>{m[2] ?? m[3]}</em>);
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdownLite(text: string): ReactNode {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key} style={{ margin: '2px 0 6px', paddingLeft: 20 }}>
          {items.map((it, k) => <li key={k}>{renderInline(it, `${key}-${k}`)}</li>)}
        </ul>,
      );
      key++;
    } else if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key} style={{ margin: '2px 0 6px', paddingLeft: 20 }}>
          {items.map((it, k) => <li key={k}>{renderInline(it, `${key}-${k}`)}</li>)}
        </ol>,
      );
      key++;
    } else if (line.trim() === '') {
      i++;
    } else {
      blocks.push(<p key={key} style={{ margin: '0 0 6px' }}>{renderInline(line, `${key}`)}</p>);
      key++;
      i++;
    }
  }
  return blocks;
}
