import { colors } from '@/tokens';
import { Avatar, Badge, Card, Fact, IconBtn } from '@/components';
import { totalMemberStats, lastVisitRecency } from '@/data/leaders';
import type { User } from '@/types';

/** The same profile-drawer shell as ContactDetail (site contacts) — a
 * Leader/Manager is an off-site role, not reachable by phone/radio the way
 * a site contact is, so there's no call-action row here. What replaces it
 * is the off-site-relevant content: purview, standing (all-time) totals,
 * and last-visit recency — a stable identity view, independent of whatever
 * month is selected back on the Leaders list.
 *
 * The role badge is always tone="primary" outline regardless of which of
 * the two roles (Safety Manager / Business Manager) it holds — role is an
 * identity tag, not a status signal, so it doesn't earn a color of its own. */
export function MemberDetail({ u, onClose }: { u: User; onClose: () => void }) {
  const stats = totalMemberStats(u);
  const recency = lastVisitRecency(u);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Avatar name={u.name} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{u.name}</div>
        </div>
        <Badge tone="primary" outline>{u.role}</Badge>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '0 0 8px' }}>Profile</div>
        <Card pad={16}>
          <Fact k="Purview" v={u.division ? `${u.division} · ${u.region}` : u.region} />
          <Fact k="Sites" v={u.sitesCount} />
          <Fact k="Total visits" v={stats.visitCount} />
          <Fact k="Total observations" v={stats.obsCount} />
          <Fact k="Last visit" v={recency.tone ? <Badge tone={recency.tone}>{recency.label}</Badge> : recency.label} last />
        </Card>
      </div>
    </>
  );
}
