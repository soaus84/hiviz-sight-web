import { colors } from '@/tokens';
import type { CSSProperties, ReactNode } from 'react';

export interface EyebrowProps {
  children: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
}

export function Eyebrow({ children, right, style }: EyebrowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px', ...style }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft }}>
        {children}
      </span>
      {right}
    </div>
  );
}
