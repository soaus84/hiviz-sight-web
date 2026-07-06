import { colors } from '@/tokens';
import type { PollOption } from '@/types';

export function PollBars({ options }: { options: PollOption[] }) {
  const total = options.reduce((sum, o) => sum + o.votes, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <div key={o.label} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', background: colors.fill, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: `${colors.blue}33` }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '7px 10px', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600 }}>
              <span>{o.label}</span>
              <span style={{ color: colors.inkSoft }}>{pct}% · {o.votes}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
