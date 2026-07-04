import { colors, softTone } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { ReactNode } from 'react';

export interface SChipProps {
  children: ReactNode;
  hue?: string;
  icon?: string;
}

export function SChip({ children, hue = colors.inkSoft, icon }: SChipProps) {
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
        background: softTone(hue),
        color: hue,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
