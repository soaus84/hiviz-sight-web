import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { CSSProperties, ReactNode } from 'react';

export interface AINoteProps {
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function AINote({ title = 'Hiviz', children, style }: AINoteProps) {
  return (
    <div style={{ background: colors.hi, borderRadius: 'var(--radius-lg)', padding: '13px 15px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <Icon name="auto_awesome" size={15} color={colors.hiInk} fill={1} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.hiInk }}>
          {title}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55, color: colors.hiInk, fontWeight: 600 }}>{children}</div>
    </div>
  );
}
