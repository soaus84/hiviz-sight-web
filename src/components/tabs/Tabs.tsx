import { colors } from '@/tokens';

export interface TabItem {
  k: string;
  label: string;
  n?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (k: string) => void;
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${colors.rule}`, marginBottom: 22, overflowX: 'auto' }}>
      {items.map((it) => {
        const on = it.k === value;
        return (
          <button
            key={it.k}
            onClick={() => onChange(it.k)}
            className="a-tab"
            style={{
              fontFamily: 'var(--font-sans)',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${on ? colors.ink : 'transparent'}`,
              padding: '0 0 12px',
              marginBottom: -1,
              fontSize: 14,
              fontWeight: on ? 700 : 600,
              color: on ? colors.ink : colors.inkMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {it.label}
            {it.n != null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-sm)',
                  background: on ? colors.hi : colors.fill,
                  color: on ? colors.hiInk : colors.inkSoft,
                }}
              >
                {it.n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
