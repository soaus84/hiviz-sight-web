import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface PillItem {
  k: string;
  label: string;
  n?: number;
  /** Shown but unselectable — e.g. a category that exists but currently has
   * nothing in it. Lets a list of pills double as "everything this could
   * ever contain", not just "what's here right now". */
  disabled?: boolean;
}

export interface PillsProps {
  items: PillItem[];
  value: string;
  onChange: (k: string) => void;
}

export function Pills({ items, value, onChange }: PillsProps) {
  const touch = useBreakpoint() !== 'desktop';
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((it) => {
        const on = it.k === value;
        return (
          <button
            key={it.k}
            onClick={() => { if (!it.disabled) onChange(it.k); }}
            disabled={it.disabled}
            className="a-pill"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              fontWeight: 600,
              padding: touch ? '10px 14px' : '6px 13px',
              minHeight: touch ? 40 : undefined,
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${on ? colors.ink : colors.rule}`,
              background: on ? colors.ink : colors.panel,
              color: on ? '#fff' : colors.inkSoft,
              cursor: it.disabled ? 'default' : 'pointer',
              opacity: it.disabled ? 0.45 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {it.label}
            {it.n != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, opacity: on ? 0.85 : 0.6 }}>{it.n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
