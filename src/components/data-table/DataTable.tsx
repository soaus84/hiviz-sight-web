import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  w?: number;
  align?: 'left' | 'right';
  mono?: boolean;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRow?: (row: T) => void;
  rowKey?: keyof T & string;
  empty?: string;
}

function keyOf<T>(row: T, rowKey: (keyof T & string) | undefined, index: number): string | number {
  if (rowKey) return String(row[rowKey]);
  return index;
}

export function DataTable<T>({ columns, rows, onRow, rowKey, empty }: DataTableProps<T>) {
  const breakpoint = useBreakpoint();

  if (rows.length === 0) {
    return (
      <div style={{ background: colors.panel, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: '36px 16px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
        {empty || 'Nothing here yet.'}
      </div>
    );
  }

  if (breakpoint === 'mobile') {
    const [primary, ...rest] = columns;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((row, i) => (
          <div
            key={keyOf(row, rowKey, i)}
            onClick={onRow ? () => onRow(row) : undefined}
            style={{
              background: colors.panel,
              border: `1px solid ${colors.rule}`,
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              cursor: onRow ? 'pointer' : 'default',
              minHeight: 44,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: rest.length ? 10 : 0 }}>{primary.render(row)}</div>
            {rest.filter((c) => c.label).map((c) => (
              <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: `1px solid ${colors.ruleSoft}` }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted }}>{c.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.ink, textAlign: 'right' }}>{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="a-scroll" style={{ background: colors.panel, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: breakpoint === 'tablet' ? 'auto' : 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align || 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: colors.inkMuted,
                  padding: '13px 16px',
                  borderBottom: `1px solid ${colors.rule}`,
                  width: c.w,
                  whiteSpace: 'nowrap',
                  background: colors.fill,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={keyOf(row, rowKey, i)}
              className={onRow ? 'a-row' : ''}
              onClick={onRow ? () => onRow(row) : undefined}
              style={{ cursor: onRow ? 'pointer' : 'default', borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}` }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align || 'left',
                    padding: '14px 16px',
                    fontSize: 13.5,
                    color: colors.ink,
                    fontWeight: 500,
                    verticalAlign: 'middle',
                    fontFamily: c.mono ? 'var(--font-mono)' : undefined,
                  }}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
