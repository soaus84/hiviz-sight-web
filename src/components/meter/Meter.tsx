import { colors } from '@/tokens';

export interface MeterProps {
  value: number;
  tone: string;
  width?: number;
}

export function Meter({ value, tone, width = 96 }: MeterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width, height: 6, borderRadius: 99, background: colors.ruleSoft, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: tone, borderRadius: 99 }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: tone }}>{value}</span>
    </div>
  );
}
