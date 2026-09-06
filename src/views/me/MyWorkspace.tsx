import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import type { Tone } from '@/tokens';
import { PageHead, Card, Eyebrow, Pills, Drawer, IconBtn, LinkBtn } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { usePurviewScope } from '@/state/PurviewScope';
import { useListKeyNav } from '@/hooks/useListKeyNav';
import { purviewPhrase } from '@/data/purview';
import { computeFocusItems } from '@/data/myWorkspace';
import { INSIGHT_KIND_LABEL, INSIGHTS_BY_ID } from '@/data/insights';
import { INVESTIGATIONS_BY_ID } from '@/data/investigations';
import { INCIDENTS_BY_ID } from '@/data/incidents';
import { BARRIER_FAILURES_BY_ID } from '@/data/barrierFailures';
import { STOP_WORK_EVENTS_BY_ID } from '@/data/stopWork';
import { VISITS } from '@/data/visits';
import { OBSERVATIONS } from '@/data/observations';
import { AttnRow } from '@/views/shared/AttnRow';
import { SEVERITY_DISPLAY as INCIDENT_SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY } from '@/views/incidents/incidentDisplay';
import { SEVERITY_DISPLAY as RISK_SEVERITY_DISPLAY } from '@/views/risk/riskDisplay';
import { InsightDetail } from '@/views/insights/InsightDetail';
import { InvestigationDetail } from '@/views/incidents/InvestigationDetail';
import { SevereIncidentReview } from '@/views/incidents/SevereIncidentReview';
import { IncidentDetail } from '@/views/incidents/IncidentDetail';
import { BarrierFailureDetail } from '@/views/risk/BarrierFailureDetail';
import { StopWorkDrawer } from '@/views/incidents/StopWorkDrawer';
import { ObsDetail } from '@/views/observations/ObsDetail';

// One pill per module's own main critical pipeline, not one per hidden
// route — severe Incidents fold into 'investigation' (same source key)
// since Investigations.tsx already treats them as one pipeline's first
// stage, not two things. Every source here is now specifically the
// manager-decision slice of its pipeline — see data/myWorkspace.ts's
// stocktake comment on computeFocusItems for exactly which status counts
// and why (e.g. Barrier Failures only counts `review`, not `open` or
// `returned`, since resolving one in the first place — and resubmitting
// after a return — is the site's job, only approving/returning the fix is
// the manager's). Observations isn't here at all:
// once logged, an observation is complete, nothing left to decide — never
// really "on your plate" the way an open item or an upcoming visit is. A
// visit does belong, but only while it's still ahead of you — past ones
// are Visits.tsx history, not this page's job.
type Source = 'investigation' | 'insight' | 'stopwork' | 'barrier' | 'visit';
const PILL_SOURCES: Source[] = ['visit', 'insight', 'investigation', 'stopwork', 'barrier'];
interface DecisionItem { id: string; source: Source; tone: Tone; label: string; title: string; meta: string; onClick: () => void }

const SOURCE_LABEL: Record<Source, string> = {
  investigation: 'Investigations', insight: 'Insights', stopwork: 'Stop Work', barrier: 'Critical Barrier Failures', visit: 'Visits',
};

// Every decision item opens its own natural detail component in a drawer,
// in place, rather than navigating away from Focus — the exact chain the
// user flagged as clunky (drawer -> navigate away -> click again -> another
// drawer). Nothing below duplicates a single line of those components'
// logic: InsightDetail/InvestigationDetail/SevereIncidentReview/
// BarrierFailureDetail are the identical prop-driven components their real
// pages already render inline in a split-pane; IncidentDetail/StopWorkDrawer
// are the identical components those pages already open in a Drawer of
// their own. This file only supplies the Drawer host and, for the three
// components that have never needed a header/close button before (because
// they've only ever lived in a split-pane), a thin DrawerPanel wrapper —
// see below.
type DrawerKind = 'incident' | 'investigation' | 'insight' | 'barrierFailure' | 'stopwork';
interface OpenDrawer { kind: DrawerKind; id: string }

/** A visit or a resolved item has nothing left to reach for, so Focus never
 * needs the escape hatch there — but Insight/Investigation/BarrierFailure
 * have real multi-record pages (board view, siblings, filters) worth
 * reaching for beyond just this one record. */
function DrawerPanel({ title, id, fullRecordPath, onClose, children }: { title: string; id: string; fullRecordPath: string; onClose: () => void; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>{id}</div>
        </div>
        <LinkBtn size="sm" icon="open_in_new" onClick={() => navigate(fullRecordPath)}>Full record</LinkBtn>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        {children}
      </div>
    </>
  );
}

/** The one page every persona lands on regardless of which workspaces are
 * in play for a client (all of them, in this prototype — see
 * data/currentUser.ts's note if a real per-client module toggle ever gets
 * modeled). This is now the *only* place "my stuff across every workspace"
 * lives — see workspaces.ts's note on why the per-type My* pages were
 * removed rather than kept alongside it. computeFocusItems is the single
 * source of truth this page and the Focus nav item's badge count both read,
 * so they can't disagree. */
export function MyWorkspace() {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const { region, division } = usePurviewScope();
  const purview = { region, division };
  const [filter, setFilter] = useState<'all' | Source>('all');
  const [drawer, setDrawer] = useState<OpenDrawer | null>(null);
  const [nestedIncidentId, setNestedIncidentId] = useState<string | null>(null);
  const [nestedObsId, setNestedObsId] = useState<string | null>(null);
  // Arrow keys move this; Enter/Space opens whatever's currently
  // highlighted — decoupled, since unlike the split-pane/table+drawer
  // pages, Focus's rows have no inline detail pane for moving to
  // immediately open.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Every *_BY_ID lookup below is read fresh at render time, not from a
  // value captured on open — so a plain re-render (this counter) is enough
  // to reflect any action taken inside a drawer, same forceRender pattern
  // the detail components themselves use for the same reason.
  const [, bump] = useState(0);
  const refresh = () => bump((v) => v + 1);

  const closeDrawer = () => { setDrawer(null); setNestedIncidentId(null); setNestedObsId(null); };

  const focus = computeFocusItems(purview, user.name);
  const decisions: DecisionItem[] = [];

  for (const i of focus.incidents) {
    const s = INCIDENT_SEVERITY_DISPLAY[i.severityClass];
    decisions.push({ id: `inc-${i.id}`, source: 'investigation', tone: s.tone, label: `Incident · ${s.label}`, title: i.description, meta: `${i.siteName} · ${i.when}`, onClick: () => setDrawer({ kind: 'incident', id: i.id }) });
  }
  for (const v of focus.investigationsMine) {
    const s = INCIDENT_SEVERITY_DISPLAY[v.severityClass];
    decisions.push({ id: `inv-${v.id}`, source: 'investigation', tone: s.tone, label: `Investigation · ${s.label}`, title: v.title, meta: `${v.siteNames.join(', ')} · Assigned to you`, onClick: () => setDrawer({ kind: 'investigation', id: v.id }) });
  }
  for (const v of focus.investigationsUnassigned) {
    const s = INCIDENT_SEVERITY_DISPLAY[v.severityClass];
    decisions.push({ id: `inv-${v.id}`, source: 'investigation', tone: s.tone, label: `Investigation · ${s.label}`, title: v.title, meta: `${v.siteNames.join(', ')} · Unassigned`, onClick: () => setDrawer({ kind: 'investigation', id: v.id }) });
  }
  for (const i of focus.stopWorkIncidentDecisions) {
    decisions.push({ id: `swi-${i.id}`, source: 'stopwork', tone: 'error', label: 'Stop Work · Needs decision', title: i.description, meta: `${i.siteName} · ${i.when}`, onClick: () => setDrawer({ kind: 'incident', id: i.id }) });
  }
  for (const b of focus.stopWorkBarrierFailureDecisions) {
    decisions.push({ id: `swb-${b.id}`, source: 'stopwork', tone: 'error', label: 'Stop Work · Needs decision', title: b.controlName, meta: `${b.siteName} · ${b.hazardName}`, onClick: () => setDrawer({ kind: 'barrierFailure', id: b.id }) });
  }
  for (const e of focus.stopWorkActive) {
    const s = STOP_WORK_STATUS_DISPLAY[e.status];
    decisions.push({ id: `sw-${e.id}`, source: 'stopwork', tone: s.tone, label: `Stop Work · ${s.label}${e.siteWide ? ' · Site-wide' : ''}`, title: e.workType, meta: `${e.siteName} · ${e.sourceId}`, onClick: () => setDrawer({ kind: 'stopwork', id: e.id }) });
  }
  for (const b of focus.barrierFailures) {
    const s = RISK_SEVERITY_DISPLAY[b.severityClass];
    decisions.push({ id: `bf-${b.id}`, source: 'barrier', tone: s.tone, label: `Critical Barrier Failure · ${s.label}`, title: b.controlName, meta: `${b.siteName} · ${b.hazardName}`, onClick: () => setDrawer({ kind: 'barrierFailure', id: b.id }) });
  }
  for (const i of focus.insightsMine) {
    const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
    decisions.push({ id: `ins-${i.id}`, source: 'insight', tone, label: `Insight · ${label}`, title: i.title, meta: `${i.siteNames.join(', ')} · Assigned to you`, onClick: () => setDrawer({ kind: 'insight', id: i.id }) });
  }
  for (const i of focus.insightsUnassigned) {
    const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
    decisions.push({ id: `ins-${i.id}`, source: 'insight', tone, label: `Insight · ${label}`, title: i.title, meta: `${i.siteNames.join(', ')} · Unassigned`, onClick: () => setDrawer({ kind: 'insight', id: i.id }) });
  }
  for (const v of VISITS.filter((v) => v.visitor === user.name && (v.state === 'live' || v.state === 'upcoming'))) {
    decisions.push({ id: `visit-${v.id}`, source: 'visit', tone: v.state === 'live' ? 'error' : 'info', label: `Visit · ${v.state === 'live' ? 'Live now' : 'Upcoming'}`, title: v.siteName, meta: v.when, onClick: () => navigate(`/visits/${v.id}`) });
  }

  const filtered = filter === 'all' ? decisions : decisions.filter((d) => d.source === filter);
  const counts: Record<Source, number> = { investigation: 0, insight: 0, stopwork: 0, barrier: 0, visit: 0 };
  for (const d of decisions) counts[d.source]++;
  // Suspended while any drawer is open — arrows shouldn't silently move the
  // highlight behind it. Activating (Enter/Space) just calls the same
  // onClick a click would, so it never drifts from what clicking does.
  useListKeyNav(filtered, focusedId, setFocusedId, !drawer, (id) => filtered.find((d) => d.id === id)?.onClick());

  // Incident-kind opens either SevereIncidentReview (still 'severe' — the
  // stop-work fork lives right there too, so the two Focus rows that can
  // point at the very same incident both land on the identical screen) or
  // IncidentDetail (already progressed/acknowledged/dismissed) — read live,
  // not fixed at the moment the drawer opened, same reasoning as the
  // components' own live-read pattern.
  const incidentDrawer = drawer?.kind === 'incident' ? INCIDENTS_BY_ID[drawer.id] : undefined;
  const investigationDrawer = drawer?.kind === 'investigation' ? INVESTIGATIONS_BY_ID[drawer.id] : undefined;
  const insightDrawer = drawer?.kind === 'insight' ? INSIGHTS_BY_ID[drawer.id] : undefined;
  const barrierFailureDrawer = drawer?.kind === 'barrierFailure' ? BARRIER_FAILURES_BY_ID[drawer.id] : undefined;
  const stopWorkDrawerEvent = drawer?.kind === 'stopwork' ? STOP_WORK_EVENTS_BY_ID[drawer.id] : undefined;
  const nestedIncident = nestedIncidentId ? INCIDENTS_BY_ID[nestedIncidentId] : undefined;
  const nestedObs = nestedObsId ? OBSERVATIONS.find((o) => o.id === nestedObsId) : undefined;

  const handleIncidentChanged = () => {
    refresh();
    if (!drawer || drawer.kind !== 'incident') return;
    const updated = INCIDENTS_BY_ID[drawer.id];
    // Mirrors Investigations.tsx's own follow-the-selection behaviour: once
    // a severe incident progresses, the interesting record becomes the
    // investigation it just opened, not the incident itself.
    if (updated?.status === 'linked' && updated.linkedInvestigationId) setDrawer({ kind: 'investigation', id: updated.linkedInvestigationId });
  };

  return (
    <div>
      <PageHead title={`Welcome back, ${user.name.split(' ')[0]}`} sub={`What needs you across ${purviewPhrase(region, division)} — including your own upcoming visits.`} />

      <Card pad={20}>
        <Eyebrow>Awaiting your decision · {decisions.length}</Eyebrow>
        <div style={{ marginBottom: decisions.length ? 14 : 0 }}>
          <Pills
            value={filter}
            onChange={(k) => setFilter(k as 'all' | Source)}
            items={[
              { k: 'all', label: 'All', n: decisions.length },
              ...PILL_SOURCES.map((s) => ({ k: s, label: SOURCE_LABEL[s], n: counts[s], disabled: counts[s] === 0 })),
            ]}
          />
        </div>
        {decisions.length === 0 && (
          <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>Nothing outstanding in {purviewPhrase(region, division)} right now.</div>
        )}
        {filtered.map((d, i) => <AttnRow key={d.id} label={d.label} tone={d.tone} title={d.title} meta={d.meta} onClick={() => { setFocusedId(d.id); d.onClick(); }} last={i === filtered.length - 1} focused={d.id === focusedId} />)}
      </Card>

      <Drawer open={!!incidentDrawer} onClose={closeDrawer}>
        {incidentDrawer && (
          incidentDrawer.status === 'severe' ? (
            <DrawerPanel title={incidentDrawer.description} id={incidentDrawer.id} fullRecordPath={`/investigations/${incidentDrawer.id}`} onClose={closeDrawer}>
              <SevereIncidentReview i={incidentDrawer} onChanged={handleIncidentChanged} />
            </DrawerPanel>
          ) : (
            <IncidentDetail i={incidentDrawer} onClose={closeDrawer} onChanged={refresh} />
          )
        )}
      </Drawer>

      <Drawer open={!!investigationDrawer} onClose={closeDrawer}>
        {investigationDrawer && (
          <DrawerPanel title={investigationDrawer.title} id={investigationDrawer.id} fullRecordPath={`/investigations/${investigationDrawer.id}`} onClose={closeDrawer}>
            <InvestigationDetail v={investigationDrawer} onOpenIncident={(id) => setNestedIncidentId(id)} onChanged={refresh} />
          </DrawerPanel>
        )}
      </Drawer>

      <Drawer open={!!insightDrawer} onClose={closeDrawer}>
        {insightDrawer && (
          <DrawerPanel title={insightDrawer.title} id={insightDrawer.id} fullRecordPath={`/insights/${insightDrawer.id}`} onClose={closeDrawer}>
            <InsightDetail i={insightDrawer} onOpenObservation={(id) => setNestedObsId(id)} onStatusChange={refresh} />
          </DrawerPanel>
        )}
      </Drawer>

      <Drawer open={!!barrierFailureDrawer} onClose={closeDrawer}>
        {barrierFailureDrawer && (
          <DrawerPanel title={barrierFailureDrawer.controlName} id={barrierFailureDrawer.id} fullRecordPath={`/risk/barrier-failures/${barrierFailureDrawer.id}`} onClose={closeDrawer}>
            <BarrierFailureDetail b={barrierFailureDrawer} onChanged={refresh} />
          </DrawerPanel>
        )}
      </Drawer>

      {stopWorkDrawerEvent && <StopWorkDrawer e={stopWorkDrawerEvent} onClose={closeDrawer} onChanged={refresh} />}

      {/* Nested one level deep, on top of whichever host drawer opened them — same stacking Investigations.tsx/Insights.tsx already do. */}
      <Drawer open={!!nestedIncident} onClose={() => setNestedIncidentId(null)}>
        {nestedIncident && <IncidentDetail i={nestedIncident} onClose={() => setNestedIncidentId(null)} onChanged={refresh} />}
      </Drawer>
      <Drawer open={!!nestedObs} onClose={() => setNestedObsId(null)}>
        {nestedObs && <ObsDetail o={nestedObs} onClose={() => setNestedObsId(null)} />}
      </Drawer>
    </div>
  );
}
