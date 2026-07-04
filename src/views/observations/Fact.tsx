import { colors } from '@/tokens';
import type { ReactNode } from 'react';

export interface FactProps {
  k: string;
  v: ReactNode;
  last?: boolean;
}

export function Fact({ k, v, last }: FactProps) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${colors.ruleSoft}` }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted, width: 110, flexShrink: 0, paddingTop: 1 }}>{k}</div>
      <div style={{ fontFamily: 'var(--font-sans)', flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, color: colors.ink }}>{v}</div>
    </div>
  );
}
