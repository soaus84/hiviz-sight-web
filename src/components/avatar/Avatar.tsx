import { colors } from '@/tokens';

export interface AvatarProps {
  name?: string;
  size?: number;
  tone?: string;
  ring?: boolean;
}

function initialsOf(name: string) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name = '', size = 32, tone, ring }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        flexShrink: 0,
        background: tone || colors.fill,
        color: tone ? colors.hiInk : colors.inkSoft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontSize: size * 0.36,
        fontWeight: 700,
        border: ring ? `2px solid ${colors.panel}` : 'none',
        boxShadow: ring ? `0 0 0 1px ${colors.rule}` : 'none',
      }}
    >
      {initialsOf(name)}
    </div>
  );
}
