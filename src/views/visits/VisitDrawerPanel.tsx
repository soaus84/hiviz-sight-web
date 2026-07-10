import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, Btn, Avatar } from '@/components';
import { SITE_ID_BY_NAME } from '@/data/sites';
import { VisitDateTile } from './VisitDateTile';
import { VisitDetailBody } from './VisitDetailBody';
import type { Visit } from '@/types';

/** Same content as VisitDetail (the full /visits/:id page), opened as a
 * Drawer straight from the Visits list instead — an ObsDetail/MemberDetail-
 * style close header in place of the page's PageHead + back link.
 *
 * Leads with a compact calendar-day tile rather than spelling the date out
 * at Stat-card size (34px) — that read as noise once it was sitting this
 * close to the top of a ~460px-wide panel. */
export function VisitDrawerPanel({ v, onClose }: { v: Visit; onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <VisitDateTile date={v.date} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{v.siteName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Avatar name={v.visitor} size={16} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>{v.visitor} · {v.when}</span>
          </div>
        </div>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {v.state === 'upcoming' && <Btn variant="ghost" icon="edit" onClick={() => navigate(`/visits/${v.id}/edit`)}>Edit visit</Btn>}
          <Btn variant="ghost" icon="location_on" onClick={() => navigate(`/sites/${SITE_ID_BY_NAME[v.siteName]}`)}>View site</Btn>
        </div>
        <VisitDetailBody v={v} nestedInDrawer />
      </div>
    </>
  );
}
