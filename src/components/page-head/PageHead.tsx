import { colors } from '@/tokens';
import type { ReactNode } from 'react';

export interface PageHeadProps {
  title: string;
  sub?: string;
  actions?: ReactNode;
}

export function PageHead({ title, sub, actions }: PageHeadProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.7, color: colors.ink, lineHeight: 1.1 }}>
          {title}
        </h1>
        {sub && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: colors.inkSoft, marginTop: 7, fontWeight: 500, maxWidth: 680, lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}
