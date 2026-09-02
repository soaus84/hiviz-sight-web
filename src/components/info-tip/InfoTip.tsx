import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { ReactNode } from 'react';

export interface InfoTipProps {
  /** Optional text shown next to the icon trigger — use when the trigger
   * stands alone (e.g. in a PageHead's actions row). Omit when it sits right
   * beside a label that already names the thing being explained (e.g. an
   * Eyebrow title), so the icon alone is enough. */
  label?: string;
  children: ReactNode;
  width?: number;
}

/** Tap-to-toggle info popover — not hover, since hover-only breaks on the
 * tablets/phones this app targets. Same lightweight anchored-popover pattern
 * already used for menus like InvestigatorMenu (backdrop + `.a-pop` panel),
 * reused here for definitions/explanations instead of choices. Deliberately
 * NOT placed inside DataTable — its desktop wrapper clips overflow, which
 * would cut the popover off. */
export function InfoTip({ label, children, width = 300 }: InfoTipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={label ? `${label} — more information` : 'More information'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          color: open ? colors.ink : colors.inkSoft,
        }}
      >
        {label}
        <Icon name="info" size={15} color={open ? colors.ink : colors.inkMuted} />
      </button>
      {open && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 8, width,
              background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)',
              zIndex: 70, padding: 14,
              fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.5, color: colors.inkSoft, fontWeight: 500,
            }}
          >
            {children}
          </div>
        </>
      )}
    </span>
  );
}
