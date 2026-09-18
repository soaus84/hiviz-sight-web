import type { ReactNode } from 'react';
import { colors } from '@/tokens';
import { Card, Icon } from '@/components';

/** One suggested-content card (toolbox talk / learn / improve on Insight;
 * contributing factors / corrective actions / interview questions on
 * Investigation) — a plain bordered card with its own icon tile, title, and
 * optional subtitle, body content in regular weight below. Deliberately
 * distinct from AINote's yellow-highlight treatment (reserved for the
 * pattern-summary/root-cause narrative on both parents) and from an all-bold
 * list — the bold-everywhere bordered-item style this replaced was hard to
 * scan when several of these sat stacked. Shared so both detail pages render
 * Hiviz-suggested content identically rather than two components that drift
 * apart over time. The icon is whatever the caller passes — usually the same
 * kind icon used elsewhere (WORK_STREAM_KIND_DISPLAY), not a generic "AI"
 * sparkle — it's identifying *what this is*, not flagging that it's
 * AI-suggested (the section header/title already does that). */
export function SuggestionCard({ icon, title, subtitle, children }: { icon: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card pad={16} style={{ boxShadow: 'none', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: colors.hi, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={19} color={colors.hiInk} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.6, fontWeight: 400 }}>{children}</div>
    </Card>
  );
}
