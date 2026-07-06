import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Tabs, Pills, Btn, IconBtn, LinkBtn, Drawer } from '@/components';
import { INSIGHTS, INSIGHTS_BY_ID, insightInRegion } from '@/data/insights';
import { OBSERVATIONS } from '@/data/observations';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { InsightDetail } from './InsightDetail';
import { InsightCard } from './InsightCard';
import { InsightsBoard } from './InsightsBoard';
import { insightsFitToHeight, type InsightsView } from './insightsLayout';
import { ObsDetail } from '@/views/observations/ObsDetail';
import type { InsightStatus } from '@/types';

const VALID_TABS: InsightStatus[] = ['review', 'action', 'closed'];
function isInsightStatus(v: string | null): v is InsightStatus {
  return !!v && (VALID_TABS as string[]).includes(v);
}

export function Insights() {
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

  const assigned = params.get('assigned') === 'unassigned' ? 'unassigned' : 'all';
  const setAssigned = (k: string) => {
    const next = new URLSearchParams(params);
    if (k === 'all') next.delete('assigned'); else next.set('assigned', k);
    setParams(next, { replace: true });
  };

  const deepLinked = id ? INSIGHTS_BY_ID[id] : undefined;
  const tabParam = params.get('tab');
  const [tab, setTabState] = useState<InsightStatus>(deepLinked?.status || (isInsightStatus(tabParam) ? tabParam : 'review'));
  const [selId, setSelId] = useState<string | null>(deepLinked?.id || null);

  useEffect(() => {
    if (deepLinked) {
      setTabState(deepLinked.status);
      setSelId(deepLinked.id);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Not memoized: INSIGHTS is a plain mutable array (status transitions
  // replace elements in place, see data/insights.ts), so a memo keyed only on
  // [region, division] would go stale the moment an insight's status changes
  // without the purview itself changing. The filter is cheap at this scale.
  const inRegion = INSIGHTS.filter((i) => insightInRegion(i, { region, division }));

  const counts = {
    review: inRegion.filter((i) => i.status === 'review').length,
    action: inRegion.filter((i) => i.status === 'action').length,
    closed: inRegion.filter((i) => i.status === 'closed').length,
  };
  const unassignedInTab = inRegion.filter((i) => i.status === tab && !i.owner).length;
  const unassignedTotal = inRegion.filter((i) => !i.owner).length;
  const list = inRegion.filter((i) => i.status === tab && (assigned === 'all' || !i.owner));

  useEffect(() => {
    if (list.find((i) => i.id === selId)) return;
    // Desktop always keeps a detail selected (two-column master-detail).
    // Below desktop, switching tabs should land back on the list, not
    // silently jump into whichever item happens to be first. Re-runs on
    // breakpoint change too, so resizing into desktop with nothing selected
    // (e.g. landing on mobile before layout measures, then widening) doesn't
    // leave the detail pane permanently empty.
    setSelId(breakpoint === 'desktop' ? (list[0]?.id ?? null) : null);
  }, [tab, breakpoint, assigned]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = INSIGHTS.find((i) => i.id === selId);

  const setTab = (k: string) => {
    setTabState(k as InsightStatus);
    setParams(k === 'review' ? {} : { tab: k }, { replace: true });
    if (id) navigate('/insights', { replace: true });
  };

  // Fired after a status-transition mutates the selected insight in place —
  // re-syncs the visible tab so the card follows it to wherever it landed,
  // and forces the re-render that surfaces the mutation (INSIGHTS is a plain
  // mutable array, not React state).
  const handleInsightChanged = () => {
    if (!selId) return;
    const updated = INSIGHTS_BY_ID[selId];
    if (!updated) return;
    setTabState(updated.status);
    setParams(updated.status === 'review' ? {} : { tab: updated.status }, { replace: true });
  };

  const selectCard = (cardId: string) => {
    setSelId(cardId);
    navigate(`/insights/${cardId}`, { replace: true });
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

  // Below desktop, the list can no longer share the row with the detail panel
  // (it would either squeeze both or stack them awkwardly) — so list and
  // detail become two full-width steps, with the detail covering the list.
  const singleColumn = breakpoint !== 'desktop';
  const showList = !singleColumn || !sel;
  const showDetail = !singleColumn || !!sel;
  const gridCols = singleColumn ? '1fr' : '360px 1fr';

  // On desktop, the detail pane should fit within the viewport with its own
  // scroll instead of pushing the whole page (list included) down when its
  // content is tall. Below desktop, list/detail are already two full-page
  // steps, so normal page scroll is the simpler, more standard behavior.
  // The board is a horizontal-scrolling read view, not a two-pane
  // master-detail, so it always uses normal page scroll regardless of view.
  const fitToHeight = insightsFitToHeight(view, breakpoint);

  return (
    <div style={{ height: fitToHeight ? '100%' : undefined, display: fitToHeight ? 'flex' : undefined, flexDirection: fitToHeight ? 'column' : undefined }}>
      {singleColumn && sel && view === 'list' ? (
        <LinkBtn icon="arrow_back" size="md" onClick={() => { setSelId(null); navigate('/insights'); }} style={{ marginBottom: 16 }}>All insights</LinkBtn>
      ) : (
        <>
          <PageHead
            title="Insights"
            sub={`Cross-site patterns Hiviz has surfaced from ${purviewPhrase(region, division)}. Review, support and route them to action.`}
            actions={
              <>
                <IconBtn name="view_list" active={view === 'list'} onClick={() => setView('list')} />
                <IconBtn name="view_kanban" active={view === 'board'} onClick={() => setView('board')} />
                <Btn variant="ghost" icon="download">Report</Btn>
              </>
            }
          />
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
        <InsightsBoard insights={assigned === 'all' ? inRegion : inRegion.filter((i) => !i.owner)} onOpen={selectCard} />
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
                <div style={{ padding: '24px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No insights in {purviewPhrase(region, division)} for this tab.</div>
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
