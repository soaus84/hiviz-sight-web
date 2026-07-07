import { colors, type Tone } from '@/tokens';
import { Avatar, Badge, Card, Fact, IconBtn } from '@/components';
import { memberStats, lastVisitRecency, type MonthRange } from '@/data/leaders';
import type { AccessLevel, User } from '@/types';

const ACCESS_TONE: Record<AccessLevel, Tone> = { Admin: 'primary', Manager: 'info', Supervisor: 'success', Observer: 'primary' };
const ACCESS_OUTLINE: Record<AccessLevel, boolean> = { Admin: false, Manager: false, Supervisor: false, Observer: true };

export function MemberDetail({ u, range, onClose }: { u: User; range: MonthRange; onClose: () => void }) {
  const stats = memberStats(u, range);
  const recency = lastVisitRecency(u);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Avatar name={u.name} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{u.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, fontWeight: 500 }}>{u.role}</div>
        </div>
        <Badge tone={ACCESS_TONE[u.access]} outline={ACCESS_OUTLINE[u.access]}>{u.access}</Badge>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '0 0 8px' }}>{range.label}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <Card pad={16} style={{ boxShadow: 'none' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 4 }}>Visits</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700 }}>{stats.visitCount}</div>
          </Card>
          <Card pad={16} style={{ boxShadow: 'none' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 4 }}>Observations</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700 }}>{stats.obsCount}</div>
          </Card>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '0 0 8px' }}>Profile</div>
        <Card pad={16}>
          <Fact k="Region" v={u.region} />
          <Fact k="Division" v={u.division ?? 'Not pinned'} />
          <Fact k="Sites" v={u.sitesCount} />
          <Fact k="Last visit" v={recency.tone ? <Badge tone={recency.tone}>{recency.label}</Badge> : recency.label} last />
        </Card>
      </div>
    </>
  );
}
