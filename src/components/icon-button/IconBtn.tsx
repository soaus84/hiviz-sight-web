import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';
import type { MouseEventHandler } from 'react';

export interface IconBtnProps {
  name: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  badge?: number | string;
  size?: number;
}

export function IconBtn({ name, onClick, active, badge, size = 20 }: IconBtnProps) {
  return (
    <button
      className="a-iconbtn"
      onClick={onClick}
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${active ? colors.ink : colors.rule}`,
        background: active ? colors.ink : colors.panel,
        color: active ? '#fff' : colors.inkSoft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={size} weight={500} />
      {badge ? (
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            borderRadius: 99,
            background: colors.hi,
            color: colors.hiInk,
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${colors.panel}`,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
