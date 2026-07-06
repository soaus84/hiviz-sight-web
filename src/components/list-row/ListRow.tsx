import { colors } from '@/tokens';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export interface ListRowProps {
  children: ReactNode;
  last?: boolean;
  gap?: number;
  padding?: string;
  align?: CSSProperties['alignItems'];
  onClick?: MouseEventHandler<HTMLDivElement>;
}

/**
 * Flex row with a bottom border that disappears on the last item in a list —
 * the "borderBottom: last ? 'none' : ..." pattern that kept getting
 * recomputed by hand across SiteDetail, Dashboard, Communities, InsightDetail
 * and a handful of bespoke row components (Fact, SettingRow, AttnRow,
 * NotifMenu's Row). Content is fully custom via children; this only owns the
 * row shell (flex, gap, padding, alignment, conditional border, optional click).
 */
export function ListRow({ children, last, gap = 12, padding = '11px 0', align = 'center', onClick }: ListRowProps) {
  return (
    <div
      className={onClick ? 'a-row' : undefined}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: align,
        gap,
        padding,
        borderBottom: last ? 'none' : `1px solid ${colors.ruleSoft}`,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {children}
    </div>
  );
}
