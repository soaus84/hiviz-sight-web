import type { CSSProperties } from 'react';

export interface IconProps {
  name: string;
  size?: number;
  weight?: number;
  fill?: 0 | 1;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, weight = 400, fill = 0, color = 'currentColor', style }: IconProps) {
  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{
        fontSize: size,
        color,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
