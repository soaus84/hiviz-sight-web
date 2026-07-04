import { colors } from '@/tokens';
import type { SignalCounts } from '@/types/visit';
import { Dot } from '../dot/Dot';

export interface SignalMixProps {
  s?: SignalCounts;
}

export function SignalMix({ s }: SignalMixProps) {
  if (!s) return <span style={{ color: colors.inkMuted, fontFamily: 'var(--font-mono)', fontSize: 12 }}>—</span>;
  const parts: Array<[number, string]> = [
    [s.pos, colors.green],
    [s.weak, colors.amber],
    [s.barrier, colors.red],
  ];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {parts.map(([n, hue], i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: n ? hue : colors.inkMuted }}>
          <Dot tone={n ? hue : colors.rule} size={7} />
          {n}
        </span>
      ))}
    </div>
  );
}
