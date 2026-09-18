import type { CSSProperties, ReactNode } from 'react';
import { colors } from '@/tokens';
import { Card } from '@/components';

/** A section title with a one-line subheading directly beneath it, and a
 * bottom rule that ties the pair to whatever content follows — replaces the
 * old bare uppercase mono label used across Investigation/Insight (see
 * `sectionLabel` in InvestigationDetail.tsx/InsightDetail.tsx/etc.), which
 * read fine in a small single-purpose drawer but got lost scanning down a
 * long primary-entity page with eight-plus of these stacked, and sat above
 * its content with a gap outside any border rather than reading as attached
 * to it (both a direct 2026-09-17 audit note). Exported on its own for a
 * section whose "content" is a heading plus an action, not a boxed block —
 * most callers want `Section` below instead. */
export function SectionHeading({ title, subtitle, action }: { title: ReactNode; subtitle: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '14px 16px 12px', borderBottom: `1px solid ${colors.ruleSoft}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 700, letterSpacing: -0.2, color: colors.ink }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

/** `SectionHeading` plus its content in one bordered `Card` — the actual fix
 * for "heading above content, outside a border, divorcing it from its
 * content visually": the title/subtitle and whatever follows now share one
 * box instead of the label floating above a separately-bordered card.
 * `footer` is for an action that manages the section's own content — "Add
 * event," "Populate with Hiviz suggestions," "Toolbox talk/Learn/Improve" —
 * rendered in the same Card below a divider (2026-09-17: these used to sit
 * as a sibling row below the Card entirely, which read as divorced from it
 * the same way the old header-above-a-separate-box pattern did). A button
 * that's a *decision about* the section's content (Approve/Send back) is a
 * different thing and stays a sibling outside `Section` — only "manage more
 * of what's in this box" actions belong in `footer`. */
export function Section({ title, subtitle, action, children, footer, pad = 16, style }: { title: ReactNode; subtitle: string; action?: ReactNode; children: ReactNode; footer?: ReactNode; pad?: number; style?: CSSProperties }) {
  return (
    <Card pad={0} style={{ boxShadow: 'none', overflow: 'hidden', marginTop: 24, ...style }}>
      <SectionHeading title={title} subtitle={subtitle} action={action} />
      <div style={{ padding: pad }}>{children}</div>
      {footer && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.ruleSoft}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {footer}
        </div>
      )}
    </Card>
  );
}
