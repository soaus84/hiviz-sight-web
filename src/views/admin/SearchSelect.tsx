import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '@/components';

export interface SearchSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  /** Adds a leading "— none —" option that clears the field — for optional
   * reference fields like a User's division. */
  clearable?: boolean;
}

/** A searchable single-select for fields that reference another
 * admin-managed list (Worksite -> Region/Division/Type/Supervisor, User ->
 * Region/Division) — same popover shell as PurviewSwitcher/
 * WorkspaceSwitcher, with a filter input since these lists can grow. */
export function SearchSelect({ value, onChange, options, placeholder = 'Select…', clearable }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()));

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${colors.rule}`,
          background: colors.panel,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 13.5, color: selected ? colors.ink : colors.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="unfold_more" size={16} color={colors.inkMuted} />
      </button>

      {open && (
        <>
          <div onClick={() => { setOpen(false); setQuery(''); }} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: colors.panel,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-popover)',
              zIndex: 70,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 8, borderBottom: `1px solid ${colors.ruleSoft}` }}>
              <input
                className="a-input"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {clearable && (
                <button
                  type="button"
                  onClick={() => select('')}
                  style={{ width: '100%', display: 'block', padding: '9px 12px', background: !value ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontStyle: 'italic' }}
                >
                  — None —
                </button>
              )}
              {filtered.length === 0 && (
                <div style={{ padding: '12px', fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted, textAlign: 'center' }}>No matches</div>
              )}
              {filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => select(o.value)}
                  style={{ width: '100%', display: 'block', padding: '9px 12px', background: o.value === value ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: colors.ink }}>{o.label}</div>
                  {o.sublabel && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>{o.sublabel}</div>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
