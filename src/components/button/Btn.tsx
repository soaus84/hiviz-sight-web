import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export type BtnVariant = 'primary' | 'accent' | 'ghost' | 'subtle' | 'danger';
export type BtnSize = 'sm' | 'md' | 'lg';

export interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: string;
  iconRight?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  full?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const VARIANT_STYLE: Record<BtnVariant, CSSProperties> = {
  primary: { background: colors.ink, color: '#fff', border: `1px solid ${colors.ink}` },
  accent: { background: colors.hi, color: colors.hiInk, border: `1px solid ${colors.hi}` },
  ghost: { background: 'transparent', color: colors.ink, border: `1px solid ${colors.rule}` },
  subtle: { background: colors.fill, color: colors.ink, border: '1px solid transparent' },
  danger: { background: 'transparent', color: colors.red, border: `1px solid ${colors.red}33` },
};

export function Btn({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, full, type }: BtnProps) {
  const pad = size === 'sm' ? '0 12px' : size === 'lg' ? '0 20px' : '0 15px';
  const h = size === 'sm' ? 32 : size === 'lg' ? 46 : 38;
  const fs = size === 'sm' ? 12.5 : 13.5;
  return (
    <button
      className={`a-btn a-btn-${variant}`}
      type={type || 'button'}
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-sans)',
        height: h,
        padding: pad,
        borderRadius: 'var(--radius-md)',
        fontSize: fs,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        width: full ? '100%' : 'auto',
        ...VARIANT_STYLE[variant],
      }}
    >
      {icon && <Icon name={icon} size={17} weight={500} />}
      {children}
      {iconRight && <Icon name={iconRight} size={17} weight={500} />}
    </button>
  );
}
