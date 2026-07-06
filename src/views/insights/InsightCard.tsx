import { colors, type Tone } from '@/tokens';
import { Avatar, Badge, Icon } from '@/components';
import type { Insight, InsightStatus } from '@/types';

const STATUS: Record<InsightStatus, [string, Tone]> = {
  review: ['Awaiting support', 'warning'],
  action: ['In action', 'primary'],
  closed: ['Closed', 'success'],
};

export interface InsightCardProps {
  i: Insight;
  onClick: () => void;
  selected?: boolean;
}

export function InsightCard({ i, onClick, selected }: InsightCardProps) {
  const [sl, sh] = STATUS[i.status];
  return (
    <div
      onClick={onClick}
      className="a-card-int"
      style={{ background: colors.panel, border: `1px solid ${selected ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: selected ? 'var(--shadow-rail)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <Badge tone={sh}>{sl}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.theme}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{i.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
        <div style={{ display: 'flex' }}>
          {i.supporterInitials.slice(0, 3).map((sp, k) => <div key={k} style={{ marginLeft: k ? -7 : 0 }}><Avatar name={sp} size={22} ring /></div>)}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{i.observationCount} obs · {i.siteNames.length} site{i.siteNames.length > 1 ? 's' : ''}</span>
        {i.routed && <span style={{ marginLeft: 'auto' }}><Icon name="lightbulb" size={15} color={colors.hiInk} fill={1} /></span>}
      </div>
    </div>
  );
}
