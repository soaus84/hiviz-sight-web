import { TONE, type Tone } from '@/tokens';
import { Dot } from '../dot/Dot';
import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  outline?: boolean;
}

export function Badge({ children, tone = 'soft', dot, outline }: BadgeProps) {
  const [bg, fg] = TONE[tone];
  return (
    <span
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
        color: fg,
        border: outline ? `1px solid ${bg}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && <Dot tone={fg} size={6} />}
      {children}
    </span>
  );
}
