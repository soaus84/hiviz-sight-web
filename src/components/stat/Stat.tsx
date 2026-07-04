import { colors } from '@/tokens';
import { Card } from '../card/Card';
import { Icon } from '../icon/Icon';

export interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: string;
  sub?: string;
  icon?: string;
  accent?: boolean;
}

export function Stat({ label, value, unit, delta, deltaTone, sub, icon, accent }: StatProps) {
  return (
    <Card pad={18} style={accent ? { background: colors.ink, borderColor: colors.ink } : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: accent ? 'rgba(255,255,255,0.6)' : colors.inkMuted,
          }}
        >
          {label}
        </span>
        {icon && <Icon name={icon} size={18} color={accent ? colors.hi : colors.inkMuted} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 700, letterSpacing: -1, color: accent ? '#fff' : colors.ink, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.6)' : colors.inkMuted }}>
            {unit}
          </span>
        )}
        {delta && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              fontWeight: 700,
              color: deltaTone || colors.green,
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Icon name="trending_up" size={14} color={deltaTone || colors.green} />
            {delta}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: accent ? 'rgba(255,255,255,0.7)' : colors.inkSoft, marginTop: 8, fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </Card>
  );
}
