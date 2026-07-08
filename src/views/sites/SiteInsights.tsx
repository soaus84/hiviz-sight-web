import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Tabs, Pills, Btn, IconBtn, LinkBtn, Drawer } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { INSIGHTS, INSIGHTS_BY_ID } from '@/data/insights';
import { OBSERVATIONS } from '@/data/observations';
import { InsightDetail } from '@/views/insights/InsightDetail';
import { InsightCard } from '@/views/insights/InsightCard';
import { InsightsBoard } from '@/views/insights/InsightsBoard';
import { insightsFitToHeight, type InsightsView } from '@/views/insights/insightsLayout';
import { ObsDetail } from '@/views/observations/ObsDetail';
import type { InsightStatus } from '@/types';

const VALID_TABS: InsightStatus[] = ['review', 'action', 'closed'];
function isInsightStatus(v: string | null): v is InsightStatus {
  return !!v && (VALID_TABS as string[]).includes(v);
}

/** The site-scoped twin of Insights.tsx — same tabs/board/master-detail
 * pattern so insights can be reviewed, supported and progressed without
 * leaving the site, instead of just linking out to the global page. Filters
 * by site membership instead of purview: a single site's insights aren't a
 * "region" scope, so the purview phrasing/filtering the global page uses
 * would be redundant here. Selection is tracked via `?insight=` (a query
 * param, like `?obs=`) rather than a nested route — there's no
 * `/sites/:id/insights/:insightId` path, this page never leaves itself. */
export function SiteInsights() {
  const { id } = useParams();
  const breakpoint = useBreakpoint();
  const [params, setParams] = useSearchParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];

  // Not memoized — see Insights.tsx: INSIGHTS mutates in place on status
  // transitions (replaceInsight in data/insights.ts), so a memo would go
  // stale the moment a status changes.
  const referencing = INSIGHTS.filter((i) => i.siteNames.includes(s.name));

  const view: InsightsView = params.get('view') === 'board' ? 'board' : 'list';
  const setView = (v: InsightsView) => {
    const next = new URLSearchParams(params);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setParams(next, { replace: true });
  };

  const assigned = params.get('assigned') === 'unassigned' ? 'unassigned' : 'all';
  const setAssigned = (k: string) => {
    const next = new URLSearchParams(params);
    if (k === 'all') next.delete('assigned'); else next.set('assigned', k);
    setParams(next, { replace: true });
  };

  const tabParam = params.get('tab');
  const [tab, setTabState] = useState<InsightStatus>(isInsightStatus(tabParam) ? tabParam : 'review');
  const selId = params.get('insight');

  const counts = {
    review: referencing.filter((i) => i.status === 'review').length,
    action: referencing.filter((i) => i.status === 'action').length,
    closed: referencing.filter((i) => i.status === 'closed').length,
  };
  const unassignedInTab = referencing.filter((i) => i.status === tab && !i.owner).length;
  const unassignedTotal = referencing.filter((i) => !i.owner).length;
  const list = referencing.filter((i) => i.status === tab && (assigned === 'all' || !i.owner));

  useEffect(() => {
    if (list.find((i) => i.id === selId)) return;
    const next = new URLSearchParams(params);
    const fallback = breakpoint === 'desktop' ? list[0]?.id : undefined;
    if (fallback) next.set('insight', fallback); else next.delete('insight');
    setParams(next, { replace: true });
  }, [tab, breakpoint, assigned]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = selId ? INSIGHTS_BY_ID[selId] : undefined;

  const setTab = (k: string) => {
    setTabState(k as InsightStatus);
    const next = new URLSearchParams(params);
    if (k === 'review') next.delete('tab'); else next.set('tab', k);
    next.delete('insight');
    setParams(next, { replace: true });
  };

  // Mirrors Insights.tsx's handleInsightChanged — re-syncs the visible tab
  // after a status transition mutates the selected insight in place, and
  // forces the re-render that surfaces it (INSIGHTS is a plain mutable
  // array, not React state).
  const handleInsightChanged = () => {
    if (!selId) return;
    const updated = INSIGHTS_BY_ID[selId];
    if (!updated) return;
    setTabState(updated.status);
    const next = new URLSearchParams(params);
    if (updated.status === 'review') next.delete('tab'); else next.set('tab', updated.status);
    setParams(next, { replace: true });
  };

  const selectCard = (cardId: string) => {
    const next = new URLSearchParams(params);
    next.set('insight', cardId);
    setParams(next, { replace: true });
  };
  const clearSelection = () => {
    const next = new URLSearchParams(params);
    next.delete('insight');
    setParams(next, { replace: true });
  };

  const selObsId = params.get('obs');
  const selObs = selObsId ? OBSERVATIONS.find((o) => o.id === selObsId) ?? null : null;
  const openObs = (obsId: string) => {
    const next = new URLSearchParams(params);
    next.set('obs', obsId);
    setParams(next);
  };
  const closeObs = () => {
    const next = new URLSearchParams(params);
    next.delete('obs');
    setParams(next);
  };

  const singleColumn = breakpoint !== 'desktop';
  const showList = !singleColumn || !sel;
  const showDetail = !singleColumn || !!sel;
  const gridCols = singleColumn ? '1fr' : '360px 1fr';
  const fitToHeight = insightsFitToHeight(view, breakpoint);

  return (
    <div style={{ height: fitToHeight ? '100%' : undefined, display: fitToHeight ? 'flex' : undefined, flexDirection: fitToHeight ? 'column' : undefined }}>
      <SiteHeader s={s} />

      {singleColumn && sel && view === 'list' ? (
        <LinkBtn icon="arrow_back" size="md" onClick={clearSelection} style={{ marginBottom: 16 }}>All insights</LinkBtn>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
            <IconBtn name="view_list" active={view === 'list'} onClick={() => setView('list')} />
            <IconBtn name="view_kanban" active={view === 'board'} onClick={() => setView('board')} />
            <Btn variant="ghost" icon="download">Report</Btn>
          </div>
          {view === 'list' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <Tabs value={tab} onChange={setTab} items={[{ k: 'review', label: 'For review', n: counts.review }, { k: 'action', label: 'In action', n: counts.action }, { k: 'closed', label: 'Resolved', n: counts.closed }]} />
              <Pills value={assigned} onChange={setAssigned} items={[{ k: 'all', label: 'All' }, { k: 'unassigned', label: 'Unassigned', n: unassignedInTab }]} />
            </div>
          )}
          {view === 'board' && (
            <div style={{ marginBottom: 16 }}>
              <Pills value={assigned} onChange={setAssigned} items={[{ k: 'all', label: 'All' }, { k: 'unassigned', label: 'Unassigned', n: unassignedTotal }]} />
            </div>
          )}
        </>
      )}

      {view === 'board' ? (
        <InsightsBoard insights={assigned === 'all' ? referencing : referencing.filter((i) => !i.owner)} onOpen={selectCard} />
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
                <div style={{ padding: '24px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No insights at this site for this tab.</div>
              )}
              {list.map((i) => <InsightCard key={i.id} i={i} selected={i.id === selId} onClick={() => selectCard(i.id)} />)}
            </div>
          )}

          {showDetail && sel && (
            <div style={{ overflowY: fitToHeight ? 'auto' : undefined, minHeight: fitToHeight ? 0 : undefined }}>
              <InsightDetail key={sel.id} i={sel} onOpenObservation={openObs} onStatusChange={handleInsightChanged} />
            </div>
          )}
        </div>
      )}

      <Drawer open={!!selObs} onClose={closeObs}>
        {selObs && <ObsDetail o={selObs} onClose={closeObs} />}
      </Drawer>
    </div>
  );
}
