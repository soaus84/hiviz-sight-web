import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface PillItem {
  k: string;
  label: string;
  n?: number;
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
            onClick={() => onChange(it.k)}
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
              cursor: 'pointer',
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
