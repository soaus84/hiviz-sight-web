import { TONE, type Tone } from '@/tokens';
import { Dot } from '../dot/Dot';
import { Icon } from '../icon/Icon';
import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone: Tone;
  icon?: string;
  dot?: boolean;
  outline?: boolean;
  onClick?: () => void;
}

export function Badge({ children, tone, icon, dot, outline, onClick }: BadgeProps) {
  const [bg, fg] = TONE[tone];
  const fgColor = outline ? bg : fg;
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        background: outline ? 'transparent' : bg,
        color: fgColor,
        border: outline ? `1px solid ${bg}` : 'none',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {dot && <Dot tone={fgColor} size={6} />}
      {icon && <Icon name={icon} size={13} color={fgColor} />}
      {children}
    </span>
  );
}
