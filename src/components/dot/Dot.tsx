export interface DotProps {
  tone?: string;
  size?: number;
  pulse?: boolean;
}

export function Dot({ tone = 'var(--color-ink-muted)', size = 8, pulse }: DotProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        background: tone,
        flexShrink: 0,
        display: 'inline-block',
        boxShadow: pulse ? `0 0 0 0 ${tone}` : 'none',
        animation: pulse ? 'a-pulse 1.8s infinite' : 'none',
      }}
    />
  );
}
