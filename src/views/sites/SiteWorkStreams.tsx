import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Badge, Icon, ListRow, Drawer } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { workStreamsForSite, workStreamParentTitle } from '@/data/workStreams';
import { workStreamDoneWord } from '@/views/shared/workStreamDisplay';
import { SiteWorkStreamDrawer } from './SiteWorkStreamDrawer';
import { Section } from '@/views/shared/SectionHeading';
import type { WorkStream, WorkStreamKind } from '@/types';

/** One row — the site's own status for this stream (Pending/Complete or
 * Pending/Delivered), not the aggregate progress the parent shows. Clicking
 * opens the respond drawer; nothing here is actionable inline. */
function StreamRow({ ws, siteId, last, onClick }: { ws: WorkStream; siteId: string; last: boolean; onClick: () => void }) {
  const mine = ws.sites.find((s) => s.siteId === siteId);
  const doneWord = workStreamDoneWord(ws.kind);
  return (
    <ListRow last={last} onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{ws.title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>From: {workStreamParentTitle(ws)}</div>
      </div>
      {mine?.complete ? <Badge tone="success" outline icon="check">{doneWord}</Badge> : <Badge tone="warning" outline>Pending</Badge>}
      <Icon name="chevron_right" size={18} color={colors.inkMuted} />
    </ListRow>
  );
}

function StreamSection({ title, subtitle, kind, streams, siteId, onOpen }: { title: string; subtitle: string; kind: WorkStreamKind; streams: WorkStream[]; siteId: string; onOpen: (ws: WorkStream) => void }) {
  const rows = streams.filter((w) => w.kind === kind);
  return (
    <Section
      title={title}
      subtitle={subtitle}
      action={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: colors.inkMuted }}>{rows.length}</span>}
    >
      {rows.length === 0 && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>Nothing here for this site.</div>
      )}
      {rows.map((ws, i) => <StreamRow key={ws.id} ws={ws} siteId={siteId} last={i === rows.length - 1} onClick={() => onOpen(ws)} />)}
    </Section>
  );
}

/** The site's own "what's asked of me" surface — see
 * [[project_corrective_actions_enquiry_spec]]. A stand-in for the real
 * site-facing Supervisor persona (not yet built): reached today via the
 * ordinary manager-purview Site drilldown, not a separate login, but the
 * response action itself (the drawer this opens) is deliberately the
 * site's own, not the parent Insight/Investigation's. */
export function SiteWorkStreams() {
  const { id } = useParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const [, forceRender] = useState(0);
  const refresh = () => forceRender((v) => v + 1);
  const [openId, setOpenId] = useState<string | null>(null);

  const streams = workStreamsForSite(s.id);
  const open = openId ? streams.find((w) => w.id === openId) ?? null : null;

  return (
    <div>
      <SiteHeader s={s} />

      <StreamSection title="Toolbox talks" subtitle="Safety talks pushed to this site to deliver to the crew." kind="toolbox_talk" streams={streams} siteId={s.id} onOpen={(ws) => setOpenId(ws.id)} />
      <StreamSection title="Enquiries" subtitle="Field questions pushed to this site to confirm in person." kind="learn" streams={streams} siteId={s.id} onOpen={(ws) => setOpenId(ws.id)} />
      <StreamSection title="Actions" subtitle="Corrective actions pushed to this site to close out." kind="improve" streams={streams} siteId={s.id} onOpen={(ws) => setOpenId(ws.id)} />

      <Drawer open={!!open} onClose={() => setOpenId(null)}>
        {open && <SiteWorkStreamDrawer ws={open} siteId={s.id} onClose={() => setOpenId(null)} onChanged={refresh} />}
      </Drawer>
    </div>
  );
}
