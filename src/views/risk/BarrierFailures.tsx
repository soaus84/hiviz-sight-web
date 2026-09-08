import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useListKeyNav } from '@/hooks/useListKeyNav';
import { PageHead, Tabs, Btn, IconBtn, LinkBtn } from '@/components';
import { BARRIER_FAILURES, BARRIER_FAILURES_BY_ID, barrierFailureInRegion } from '@/data/barrierFailures';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { BarrierFailureDetail } from './BarrierFailureDetail';
import { BarrierFailureCard } from './BarrierFailureCard';
import { BarrierFailuresBoard } from './BarrierFailuresBoard';
import { insightsFitToHeight, type InsightsView } from '@/views/insights/insightsLayout';
import type { BarrierFailureStatus } from '@/types';

export interface BarrierFailuresProps {
  /** Restricts this page to failures whose hazard severity requires manager
   * approval (serious/critical) — 'review'/'returned' only exist for these;
   * minor/moderate resolve directly (see resolveDirectly's own guard) and
   * can never reach them, so the routine page (this prop omitted) only ever
   * needs an Open/Resolved pair of tabs. Same severity-based split
   * Incidents/Investigations already use (a routine list vs a decision
   * queue) — one shared page component here rather than two, since
   * BarrierFailure, unlike Incident/Investigation, is a single entity type
   * with one status enum throughout, not two entity types being merged.
   * Severity is fixed for a record's whole lifetime (no mutator reassigns
   * it), so a record never needs to move from one page to the other. */
  critical?: boolean;
  title?: string;
  sub?: string;
}

// No row-set override, unlike Insights/Investigations/Visits/Observations —
// Barrier Failures has no per-person assignee (site supervisor/advisor's
// structural duty, see data/myWorkspace.ts's top-of-file note), so
// purview-scoped IS the personal view already; MyBarrierFailures.tsx
// renders this component unchanged bar a friendlier title.
export function BarrierFailures({ critical = false, title, sub }: BarrierFailuresProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const breakpoint = useBreakpoint();
  const { region, division } = usePurviewScope();

  const basePath = critical ? '/risk/critical-barrier-failures' : '/risk/barrier-failures';
  const visibleTabs: BarrierFailureStatus[] = critical ? ['open', 'review', 'returned', 'resolved'] : ['open', 'resolved'];
  function isVisibleTab(v: string | null): v is BarrierFailureStatus {
    return !!v && (visibleTabs as string[]).includes(v);
  }
  const defaultTab: BarrierFailureStatus = critical ? 'review' : 'open';

  const view: InsightsView = params.get('view') === 'board' ? 'board' : 'list';
  const setView = (v: InsightsView) => {
    const next = new URLSearchParams(params);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setParams(next, { replace: true });
  };

  const deepLinked = id ? BARRIER_FAILURES_BY_ID[id] : undefined;
  const tabParam = params.get('tab');
  const [tab, setTabState] = useState<BarrierFailureStatus>(deepLinked?.status || (isVisibleTab(tabParam) ? tabParam : defaultTab));
  const [selId, setSelId] = useState<string | null>(deepLinked?.id || null);

  useEffect(() => {
    if (deepLinked) { setTabState(deepLinked.status); setSelId(deepLinked.id); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Not memoized — BARRIER_FAILURES mutates in place, same reasoning as Insights.tsx.
  const inRegion = BARRIER_FAILURES.filter((b) => barrierFailureInRegion(b, { region, division }) && b.requiresApproval === critical);

  const counts = {
    open: inRegion.filter((b) => b.status === 'open').length,
    review: inRegion.filter((b) => b.status === 'review').length,
    returned: inRegion.filter((b) => b.status === 'returned').length,
    resolved: inRegion.filter((b) => b.status === 'resolved').length,
  };
  const list = inRegion.filter((b) => b.status === tab);

  useEffect(() => {
    if (list.find((b) => b.id === selId)) return;
    setSelId(breakpoint === 'desktop' ? (list[0]?.id ?? null) : null);
  }, [tab, breakpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = BARRIER_FAILURES.find((b) => b.id === selId);

  const setTab = (k: string) => {
    setTabState(k as BarrierFailureStatus);
    setParams(k === defaultTab ? {} : { tab: k }, { replace: true });
    if (id) navigate(basePath, { replace: true });
  };

  const handleChanged = () => {
    if (!selId) return;
    const updated = BARRIER_FAILURES_BY_ID[selId];
    if (!updated) return;
    setTabState(updated.status);
    setParams(updated.status === defaultTab ? {} : { tab: updated.status }, { replace: true });
  };

  const selectCard = (cardId: string) => {
    setSelId(cardId);
    navigate(`${basePath}/${cardId}`, { replace: true });
  };
  useListKeyNav(list, selId, selectCard, view === 'list');

  const singleColumn = breakpoint !== 'desktop';
  const showList = !singleColumn || !sel;
  const showDetail = !singleColumn || !!sel;
  const gridCols = singleColumn ? '1fr' : '360px 1fr';
  const fitToHeight = insightsFitToHeight(view, breakpoint);

  return (
    <div style={{ height: fitToHeight ? '100%' : undefined, display: fitToHeight ? 'flex' : undefined, flexDirection: fitToHeight ? 'column' : undefined }}>
      {singleColumn && sel && view === 'list' ? (
        <LinkBtn icon="arrow_back" size="md" onClick={() => { setSelId(null); navigate(basePath); }} style={{ marginBottom: 16 }}>All {critical ? 'critical ' : ''}barrier failures</LinkBtn>
      ) : (
        <>
          <PageHead
            title={title ?? (critical ? 'Critical Barrier Failures' : 'Barrier Failures')}
            sub={sub ?? (critical
              ? `Serious and critical control failures awaiting review, across ${purviewPhrase(region, division)}.`
              : `Minor and moderate control verifications, resolved directly by site, across ${purviewPhrase(region, division)}.`)}
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
              <Tabs
                value={tab}
                onChange={setTab}
                items={critical
                  ? [{ k: 'open', label: 'Open', n: counts.open }, { k: 'review', label: 'In review', n: counts.review }, { k: 'returned', label: 'Returned', n: counts.returned }, { k: 'resolved', label: 'Resolved', n: counts.resolved }]
                  : [{ k: 'open', label: 'Open', n: counts.open }, { k: 'resolved', label: 'Resolved', n: counts.resolved }]}
              />
            </div>
          )}
        </>
      )}

      {view === 'board' ? (
        <BarrierFailuresBoard failures={inRegion} onOpen={selectCard} critical={critical} />
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
                <div style={{ padding: '24px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No barrier failures in {purviewPhrase(region, division)} for this tab.</div>
              )}
              {list.map((b) => <BarrierFailureCard key={b.id} b={b} selected={b.id === selId} onClick={() => selectCard(b.id)} />)}
            </div>
          )}

          {showDetail && sel && (
            <div style={{ overflowY: fitToHeight ? 'auto' : undefined, minHeight: fitToHeight ? 0 : undefined }}>
              <BarrierFailureDetail key={sel.id} b={sel} onChanged={handleChanged} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
