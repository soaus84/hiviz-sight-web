import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export type LinkBtnSize = 'xs' | 'sm' | 'md';

export interface LinkBtnProps {
  children: ReactNode;
  icon?: string;
  size?: LinkBtnSize;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

const FONT_SIZE: Record<LinkBtnSize, number> = { xs: 10.5, sm: 11, md: 12 };
const LETTER_SPACING: Record<LinkBtnSize, number> = { xs: 0.5, sm: 0.6, md: 0.6 };

/**
 * Uppercase mono text-link — the "View all" / "Mark all read" pattern used in
 * Eyebrow actions, and (with an icon) the "back to list" nav pattern used at
 * the top of detail views. No border/background, unlike Btn's ghost variant.
 */
export function LinkBtn({ children, icon, size = 'sm', onClick, style }: LinkBtnProps) {
  return (
    <button
      className="a-link"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: FONT_SIZE[size],
        fontWeight: 700,
        color: colors.inkSoft,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textTransform: 'uppercase',
        letterSpacing: LETTER_SPACING[size],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
