import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Tabs, Btn, IconBtn, LinkBtn } from '@/components';
import { BARRIER_FAILURES, BARRIER_FAILURES_BY_ID, barrierFailureInRegion } from '@/data/barrierFailures';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { BarrierFailureDetail } from './BarrierFailureDetail';
import { BarrierFailureCard } from './BarrierFailureCard';
import { BarrierFailuresBoard } from './BarrierFailuresBoard';
import { insightsFitToHeight, type InsightsView } from '@/views/insights/insightsLayout';
import type { BarrierFailureStatus } from '@/types';

const VALID_TABS: BarrierFailureStatus[] = ['open', 'pending_approval', 'resolved'];
function isBarrierFailureStatus(v: string | null): v is BarrierFailureStatus {
  return !!v && (VALID_TABS as string[]).includes(v);
}

export function BarrierFailures() {
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

  const deepLinked = id ? BARRIER_FAILURES_BY_ID[id] : undefined;
  const tabParam = params.get('tab');
  const [tab, setTabState] = useState<BarrierFailureStatus>(deepLinked?.status || (isBarrierFailureStatus(tabParam) ? tabParam : 'open'));
  const [selId, setSelId] = useState<string | null>(deepLinked?.id || null);

  useEffect(() => {
    if (deepLinked) { setTabState(deepLinked.status); setSelId(deepLinked.id); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Not memoized — BARRIER_FAILURES mutates in place, same reasoning as Insights.tsx.
  const inRegion = BARRIER_FAILURES.filter((b) => barrierFailureInRegion(b, { region, division }));

  const counts = {
    open: inRegion.filter((b) => b.status === 'open').length,
    pending_approval: inRegion.filter((b) => b.status === 'pending_approval').length,
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
    setParams(k === 'open' ? {} : { tab: k }, { replace: true });
    if (id) navigate('/risk/barrier-failures', { replace: true });
  };

  const handleChanged = () => {
    if (!selId) return;
    const updated = BARRIER_FAILURES_BY_ID[selId];
    if (!updated) return;
    setTabState(updated.status);
    setParams(updated.status === 'open' ? {} : { tab: updated.status }, { replace: true });
  };

  const selectCard = (cardId: string) => {
    setSelId(cardId);
    navigate(`/risk/barrier-failures/${cardId}`, { replace: true });
  };

  const singleColumn = breakpoint !== 'desktop';
  const showList = !singleColumn || !sel;
  const showDetail = !singleColumn || !!sel;
  const gridCols = singleColumn ? '1fr' : '360px 1fr';
  const fitToHeight = insightsFitToHeight(view, breakpoint);

  return (
    <div style={{ height: fitToHeight ? '100%' : undefined, display: fitToHeight ? 'flex' : undefined, flexDirection: fitToHeight ? 'column' : undefined }}>
      {singleColumn && sel && view === 'list' ? (
        <LinkBtn icon="arrow_back" size="md" onClick={() => { setSelId(null); navigate('/risk/barrier-failures'); }} style={{ marginBottom: 16 }}>All barrier failures</LinkBtn>
      ) : (
        <>
          <PageHead
            title="Barrier Failures"
            sub={`Control verifications that came back not-in-place across ${purviewPhrase(region, division)}.`}
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
              <Tabs value={tab} onChange={setTab} items={[{ k: 'open', label: 'Open', n: counts.open }, { k: 'pending_approval', label: 'Pending approval', n: counts.pending_approval }, { k: 'resolved', label: 'Resolved', n: counts.resolved }]} />
            </div>
          )}
        </>
      )}

      {view === 'board' ? (
        <BarrierFailuresBoard failures={inRegion} onOpen={selectCard} />
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
