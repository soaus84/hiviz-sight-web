import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useListKeyNav } from '@/hooks/useListKeyNav';
import { PageHead, Tabs, Btn, IconBtn, LinkBtn, Drawer } from '@/components';
import { INVESTIGATIONS, INVESTIGATIONS_BY_ID, investigationInRegion } from '@/data/investigations';
import { INCIDENTS, INCIDENTS_BY_ID, incidentInRegion } from '@/data/incidents';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { InvestigationDetail } from './InvestigationDetail';
import { InvestigationCard } from './InvestigationCard';
import { SevereIncidentReview } from './SevereIncidentReview';
import { SevereIncidentCard } from './SevereIncidentCard';
import { InvestigationsBoard } from './InvestigationsBoard';
import { IncidentDetail } from './IncidentDetail';
import { insightsFitToHeight, type InsightsView } from '@/views/insights/insightsLayout';
import type { Incident, Investigation } from '@/types';

// Three pipeline stages — the first ('review') is severe Incidents awaiting
// the Acknowledge/Progress decision, the other two are real Investigation
// records. Not InvestigationStatus: that type only covers open/closed, since
// the review/triage gate happens one step earlier, on the Incident. See the
// top-of-file note in data/investigations.ts.
type PipelineTab = 'review' | 'open' | 'closed';
const VALID_TABS: PipelineTab[] = ['review', 'open', 'closed'];
function isPipelineTab(v: string | null): v is PipelineTab {
  return !!v && (VALID_TABS as string[]).includes(v);
}

export interface InvestigationsProps {
  /** Pre-filtered row overrides — used by MyInvestigations.tsx to reuse
   * this exact page (tabs, board/list toggle, detail panels, every action)
   * scoped to one person instead of the whole purview. Everything below
   * this line is unchanged either way. All three or none — a partial
   * override would leave the tab counts telling two different stories. */
  rows?: { severeIncidents: Incident[]; openInvestigations: Investigation[]; closedInvestigations: Investigation[] };
  title?: string;
  sub?: string;
}

export function Investigations({ rows, title, sub }: InvestigationsProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const breakpoint = useBreakpoint();
  const { region, division } = usePurviewScope();

  const view: InsightsView = params.get('view') === 'board' ? 'board' : 'list';
  const setView = (v: InsightsView) => {
    const next = new URLSearchParams(params);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setParams(next, { replace: true });
  };

  // A deep-linked id only ever resolves against one of the two stores in
  // practice — the app only ever links here with a severe incident's id (from
  // the review list itself) or an investigation's id (from a "source
  // incident" or the systemic-cause link) — never a non-severe incident id.
  const deepLinkedIncident = id ? INCIDENTS_BY_ID[id] : undefined;
  const deepLinkedInvestigation = id ? INVESTIGATIONS_BY_ID[id] : undefined;
  const tabParam = params.get('tab');
  const initialTab: PipelineTab = deepLinkedIncident ? 'review' : deepLinkedInvestigation?.status || (isPipelineTab(tabParam) ? tabParam : 'review');
  const [tab, setTabState] = useState<PipelineTab>(initialTab);
  const [selId, setSelId] = useState<string | null>(id ?? null);

  useEffect(() => {
    if (deepLinkedIncident) { setTabState('review'); setSelId(deepLinkedIncident.id); }
    else if (deepLinkedInvestigation) { setTabState(deepLinkedInvestigation.status); setSelId(deepLinkedInvestigation.id); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Not memoized — both stores mutate in place, same reasoning as Insights.tsx.
  const severeIncidents = rows?.severeIncidents ?? INCIDENTS.filter((i) => i.status === 'severe' && incidentInRegion(i, { region, division }));
  const openInvestigations = rows?.openInvestigations ?? INVESTIGATIONS.filter((v) => v.status === 'open' && investigationInRegion(v, { region, division }));
  const closedInvestigations = rows?.closedInvestigations ?? INVESTIGATIONS.filter((v) => v.status === 'closed' && investigationInRegion(v, { region, division }));

  const counts = { review: severeIncidents.length, open: openInvestigations.length, closed: closedInvestigations.length };
  const list: { id: string }[] = tab === 'review' ? severeIncidents : tab === 'open' ? openInvestigations : closedInvestigations;

  useEffect(() => {
    if (list.find((item) => item.id === selId)) return;
    setSelId(breakpoint === 'desktop' ? (list[0]?.id ?? null) : null);
  }, [tab, breakpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const selIncident = selId ? INCIDENTS_BY_ID[selId] : undefined;
  const selInvestigation = selId ? INVESTIGATIONS_BY_ID[selId] : undefined;

  const setTab = (k: string) => {
    setTabState(k as PipelineTab);
    setParams(k === 'review' ? {} : { tab: k }, { replace: true });
    if (id) navigate('/investigations', { replace: true });
  };

  const selectItem = (itemId: string) => {
    setSelId(itemId);
    navigate(`/investigations/${itemId}`, { replace: true });
  };
  useListKeyNav(list, selId, selectItem, view === 'list');

  // Fired after a severe incident is acknowledged or progressed. Progressing
  // creates a real Investigation and links the incident to it — follow the
  // selection there and land on the 'open' tab, mirroring how Insight's
  // "Progress to action" carries the selection forward. Acknowledging exits
  // the pipeline entirely (it's not review/open/closed) — clear selection.
  const handleIncidentChanged = () => {
    if (!selId) return;
    const updated = INCIDENTS_BY_ID[selId];
    if (!updated || updated.status === 'severe') return;
    if (updated.status === 'linked' && updated.linkedInvestigationId) {
      setTabState('open');
      setParams({ tab: 'open' }, { replace: true });
      selectItem(updated.linkedInvestigationId);
      return;
    }
    // Acknowledged — this incident just left the 'review' list entirely, so
    // (unlike Insight, where a status change always keeps the same id
    // visible somewhere) there's nothing for the selection to follow.
    // Recomputed fresh rather than reading the closed-over `severeIncidents`
    // from render scope, which is already stale by the time this runs.
    const stillInReview = INCIDENTS.filter((i) => i.status === 'severe' && i.id !== selId && incidentInRegion(i, { region, division }));
    const next = breakpoint === 'desktop' ? (stillInReview[0]?.id ?? null) : null;
    setSelId(next);
    navigate(next ? `/investigations/${next}` : '/investigations', { replace: true });
  };

  const handleInvestigationChanged = () => {
    if (!selId) return;
    const updated = INVESTIGATIONS_BY_ID[selId];
    if (!updated) return;
    setTabState(updated.status);
    setParams(updated.status === 'closed' ? { tab: 'closed' } : {}, { replace: true });
  };

  const selIncId = params.get('inc');
  const selIncDrawer = selIncId ? INCIDENTS.find((i) => i.id === selIncId) ?? null : null;
  const openIncidentDrawer = (incId: string) => {
    const next = new URLSearchParams(params);
    next.set('inc', incId);
    setParams(next);
  };
  const closeIncidentDrawer = () => {
    const next = new URLSearchParams(params);
    next.delete('inc');
    setParams(next);
  };

  const singleColumn = breakpoint !== 'desktop';
  const sel = selIncident?.status === 'severe' ? selIncident : selInvestigation;
  const showList = !singleColumn || !sel;
  const showDetail = !singleColumn || !!sel;
  const gridCols = singleColumn ? '1fr' : '360px 1fr';
  const fitToHeight = insightsFitToHeight(view, breakpoint);

  return (
    <div style={{ height: fitToHeight ? '100%' : undefined, display: fitToHeight ? 'flex' : undefined, flexDirection: fitToHeight ? 'column' : undefined }}>
      {singleColumn && sel && view === 'list' ? (
        <LinkBtn icon="arrow_back" size="md" onClick={() => { setSelId(null); navigate('/investigations'); }} style={{ marginBottom: 16 }}>All investigations</LinkBtn>
      ) : (
        <>
          <PageHead
            title={title ?? 'Investigations'}
            sub={sub ?? `Severe incidents awaiting review, through to closed investigations, in ${purviewPhrase(region, division)}.`}
            actions={
              <>
                <IconBtn name="view_list" active={view === 'list'} onClick={() => setView('list')} />
                <IconBtn name="view_kanban" active={view === 'board'} onClick={() => setView('board')} />
                <Btn variant="ghost" icon="download">Report</Btn>
              </>
            }
          />
          {view === 'list' && (
            <div style={{ marginBottom: 20 }}>
              <Tabs value={tab} onChange={setTab} items={[{ k: 'review', label: 'Needs review', n: counts.review }, { k: 'open', label: 'Investigating', n: counts.open }, { k: 'closed', label: 'Closed', n: counts.closed }]} />
            </div>
          )}
        </>
      )}

      {view === 'board' ? (
        <InvestigationsBoard severeIncidents={severeIncidents} investigations={[...openInvestigations, ...closedInvestigations]} onOpenIncident={selectItem} onOpenInvestigation={selectItem} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: 16,
            alignItems: fitToHeight ? 'stretch' : 'start',
            flex: fitToHeight ? 1 : undefined,
            minHeight: fitToHeight ? 0 : undefined,
          }}
        >
          {showList && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflowY: fitToHeight ? 'auto' : undefined,
                minHeight: fitToHeight ? 0 : undefined,
                paddingRight: fitToHeight ? 2 : undefined,
              }}
            >
              {list.length === 0 && (
                <div style={{ padding: '24px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No investigations in {purviewPhrase(region, division)} for this tab.</div>
              )}
              {tab === 'review'
                ? severeIncidents.map((i) => <SevereIncidentCard key={i.id} i={i} selected={i.id === selId} onClick={() => selectItem(i.id)} />)
                : (tab === 'open' ? openInvestigations : closedInvestigations).map((v) => <InvestigationCard key={v.id} v={v} selected={v.id === selId} onClick={() => selectItem(v.id)} />)}
            </div>
          )}

          {showDetail && sel && (
            <div style={{ overflowY: fitToHeight ? 'auto' : undefined, minHeight: fitToHeight ? 0 : undefined }}>
              {selIncident?.status === 'severe'
                ? <SevereIncidentReview key={selIncident.id} i={selIncident} onChanged={handleIncidentChanged} />
                : selInvestigation && <InvestigationDetail key={selInvestigation.id} v={selInvestigation} onOpenIncident={openIncidentDrawer} onChanged={handleInvestigationChanged} />}
            </div>
          )}
        </div>
      )}

      <Drawer open={!!selIncDrawer} onClose={closeIncidentDrawer}>
        {selIncDrawer && <IncidentDetail i={selIncDrawer} onClose={closeIncidentDrawer} />}
      </Drawer>
    </div>
  );
}
