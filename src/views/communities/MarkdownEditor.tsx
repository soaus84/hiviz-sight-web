import { useRef } from 'react';
import { colors } from '@/tokens';
import { IconBtn } from '@/components';

const TOOLBAR = [
  { name: 'format_bold', label: 'Bold' },
  { name: 'format_italic', label: 'Italic' },
  { name: 'format_list_bulleted', label: 'Bulleted list' },
  { name: 'format_list_numbered', label: 'Numbered list' },
] as const;

type ToolbarAction = (typeof TOOLBAR)[number]['name'];

// Sets the textarea's value through React's own tracked setter (rather than
// just `el.value = …`) so the subsequent `input` event is one React's
// onChange actually picks up — same trick a plain paste/typed keystroke
// relies on.
function setNativeValue(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function wrapSelection(el: HTMLTextAreaElement, marker: string, placeholder: string) {
  const { value, selectionStart: s, selectionEnd: e } = el;
  const already = value.slice(s - marker.length, s) === marker && value.slice(e, e + marker.length) === marker;
  if (already) {
    return { next: value.slice(0, s - marker.length) + value.slice(s, e) + value.slice(e + marker.length), start: s - marker.length, end: e - marker.length };
  }
  const selected = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + marker + selected + marker + value.slice(e);
  return { next, start: s + marker.length, end: s + marker.length + selected.length };
}

function toggleListBlock(el: HTMLTextAreaElement, prefixFor: (line: string, i: number) => string, isPrefixed: (line: string) => boolean) {
  const { value, selectionStart: s, selectionEnd: e } = el;
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  const lineEndIdx = value.indexOf('\n', e);
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const allPrefixed = lines.every((l) => l.trim() === '' || isPrefixed(l));
  const nextLines = lines.map((l, i) => {
    if (l.trim() === '') return l;
    if (allPrefixed) return l.replace(/^(-\s+|\d+\.\s+)/, '');
    return prefixFor(l, i);
  });
  const nextBlock = nextLines.join('\n');
  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
  return { next, start: lineStart, end: lineStart + nextBlock.length };
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  style?: React.CSSProperties;
}

/**
 * Basic, locked-down formatting only — bold, italic, bullet and numbered
 * lists (the same handful Slack/Apple Notes lead with). No links, headings,
 * code or raw HTML: the toolbar is the only way in, so renderMarkdownLite
 * never has to parse anything wider than what it produced itself.
 */
export function MarkdownEditor({ value, onChange, placeholder, rows = 4, style }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const run = (action: ToolbarAction) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    let result: { next: string; start: number; end: number };
    if (action === 'format_bold') result = wrapSelection(el, '**', 'bold text');
    else if (action === 'format_italic') result = wrapSelection(el, '*', 'italic text');
    else if (action === 'format_list_bulleted') result = toggleListBlock(el, (l) => `- ${l}`, (l) => /^-\s+/.test(l));
    else result = toggleListBlock(el, (l, i) => `${i + 1}. ${l}`, (l) => /^\d+\.\s+/.test(l));

    setNativeValue(el, result.next);
    onChange(result.next);
    requestAnimationFrame(() => el.setSelectionRange(result.start, result.end));
  };

  return (
    <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: 6, borderBottom: `1px solid ${colors.rule}`, background: colors.fill }}>
        {TOOLBAR.map((t) => (
          <IconBtn key={t.name} name={t.name} size={16} onClick={() => run(t.name)} />
        ))}
      </div>
      <textarea
        ref={ref}
        className="a-input"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none', resize: 'vertical', display: 'block', ...style }}
      />
    </div>
  );
}
