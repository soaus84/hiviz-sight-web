import { colors } from '@/tokens';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  interactive?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, pad = 18, style, interactive, onClick }: CardProps) {
  return (
    <div
      className={interactive ? 'a-card a-card-int' : 'a-card'}
      onClick={onClick}
      style={{
        background: colors.panel,
        border: `1px solid ${colors.rule}`,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        padding: pad,
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
