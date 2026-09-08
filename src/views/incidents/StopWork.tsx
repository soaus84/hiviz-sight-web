import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useListKeyNav } from '@/hooks/useListKeyNav';
import { PageHead, Card, Tabs, Badge, Icon, Drawer } from '@/components';
import { STOP_WORK_EVENTS, stopWorkEventInRegion, formatWhen } from '@/data/stopWork';
import { INCIDENTS_BY_ID } from '@/data/incidents';
import { BARRIER_FAILURES_BY_ID } from '@/data/barrierFailures';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { StopWorkCard } from './StopWorkCard';
import { StopWorkDrawer } from './StopWorkDrawer';
import { IncidentDetail } from './IncidentDetail';
import { DrawerPanel } from '@/views/shared/DrawerPanel';
import { BarrierFailureDetail } from '@/views/risk/BarrierFailureDetail';
import { STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import type { StopWorkEvent, StopWorkStatus } from '@/types';

// The live queue — everything past this is history, not something to act
// on. pending_stop keeps its own column: "already requested, awaiting site
// confirmation" is a genuinely different queue from "work is stopped,
// awaiting resume," not a sub-state of it. There's no "needs review" column
// any more — the warranted-but-not-called decision lives on the source
// Incident/BarrierFailure itself (see data/stopWork.ts's top-of-file note),
// so nothing here is ever undecided; every event this board shows is a
// real, currently-happening or already-resolved stop.
const ACTIVE_COLUMNS: { statuses: StopWorkStatus[]; label: string }[] = [
  { statuses: ['pending_stop'], label: 'Stop requested' },
  { statuses: ['stopped'], label: 'Work stopped' },
];

function terminalAt(e: StopWorkEvent): string | undefined {
  return e.resumedAt;
}
function terminalBy(e: StopWorkEvent): string | undefined {
  return e.resumedBy;
}

/** Sourced from an Incident's or a BarrierFailure's stop-work fields — see
 * data/stopWork.ts's top-of-file note. Two tabs, not one long board: Active
 * is the live queue (pending_stop/stopped — things that still need
 * someone), History is every resumed outcome, kept as a real destination
 * rather than a shrinking footer note under the kanban. */
export interface StopWorkProps {
  title?: string;
  sub?: string;
}

// No row-set override, unlike Insights/Investigations/Visits/Observations —
// Stop Work has no per-person assignee (see data/myWorkspace.ts's
// top-of-file note), so purview-scoped IS the personal view already;
// MyStopWork.tsx renders this component unchanged bar a friendlier title.
export function StopWork({ title, sub }: StopWorkProps = {}) {
  const stacked = useBreakpoint() === 'mobile';
  const { region, division } = usePurviewScope();
  const purview = { region, division };
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  // Reads an initial deep-link (e.g. from Focus) once; not kept in sync
  // with the URL afterward, same one-shot pattern as this app's other
  // ?id= deep links into a page that otherwise manages selection locally.
  const [selId, setSelId] = useState<string | null>(() => params.get('id'));
  // STOP_WORK_EVENTS mutates in place — nothing else here re-renders when a
  // drawer action changes an event's status, so force it explicitly.
  const [, forceRender] = useState(0);
  // The source's own drawer, nested one level over the primary StopWorkDrawer
  // — never given its own onOpenX props (IncidentDetail/BarrierFailureDetail
  // here don't get onOpenStopWork/onOpenInvestigation), so nesting stops here.
  const [nestedSource, setNestedSource] = useState<{ kind: 'incident' | 'barrierFailure'; id: string } | null>(null);

  // Not memoized — STOP_WORK_EVENTS mutates in place.
  const inRegion = STOP_WORK_EVENTS.filter((e) => stopWorkEventInRegion(e, purview));
  const active = inRegion.filter((e) => e.status === 'pending_stop' || e.status === 'stopped');
  const historyList = inRegion
    .filter((e) => e.status === 'resumed')
    .sort((a, b) => new Date(terminalAt(b) ?? 0).getTime() - new Date(terminalAt(a) ?? 0).getTime());
  // Same left-to-right column order the board renders, flattened into one
  // navigable sequence — arrow keys move through columns like reading order.
  const activeOrdered = ACTIVE_COLUMNS.flatMap((col) => inRegion.filter((e) => col.statuses.includes(e.status)));
  useListKeyNav(tab === 'active' ? activeOrdered : historyList, selId, setSelId);

  const sel = STOP_WORK_EVENTS.find((e) => e.id === selId) ?? null;

  return (
    <div>
      <PageHead
        title={title ?? 'Stop Work'}
        sub={sub ?? `Work actually stopped — from an Incident or a critical Barrier Failure — across ${purviewPhrase(region, division)}.`}
      />

      <Tabs
        value={tab}
        onChange={(k) => setTab(k as 'active' | 'history')}
        items={[
          { k: 'active', label: 'Active', n: active.length },
          { k: 'history', label: 'History', n: historyList.length },
        ]}
      />

      {tab === 'active' ? (
        <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: stacked ? 24 : 16, overflowX: stacked ? undefined : 'auto', alignItems: stacked ? 'stretch' : 'flex-start', paddingBottom: 4 }}>
          {ACTIVE_COLUMNS.map((col) => {
            const items = inRegion
              .filter((e) => col.statuses.includes(e.status))
              .sort((a, b) => col.statuses.indexOf(a.status) - col.statuses.indexOf(b.status));
            return (
              <div key={col.label} style={{ width: stacked ? '100%' : 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, padding: '2px 2px 4px' }}>
                  {col.label} · {items.length}
                </div>
                {items.length === 0 && (
                  <Card pad={18} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13, fontWeight: 500 }}>Nothing here.</Card>
                )}
                {items.map((e) => <StopWorkCard key={e.id} e={e} selected={e.id === selId} onClick={() => setSelId(e.id)} />)}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {historyList.length === 0 ? (
            <Card pad={28} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>Nothing here yet.</Card>
          ) : (
            <Card pad={4}>
              {historyList.map((e, i) => {
                const status = STOP_WORK_STATUS_DISPLAY[e.status];
                const at = terminalAt(e);
                return (
                  <div key={e.id} onClick={() => setSelId(e.id)} className="a-card-int" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{e.workType}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: colors.inkMuted, marginTop: 1 }}>{e.siteName} · {terminalBy(e)}{at ? ` · ${formatWhen(at)}` : ''}</div>
                    </div>
                    <Icon name="chevron_right" size={18} color={colors.inkMuted} />
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {sel && (
        <StopWorkDrawer
          key={sel.id} e={sel} onClose={() => setSelId(null)} onChanged={() => forceRender((v) => v + 1)}
          onOpenSource={(kind, id) => setNestedSource({ kind, id })}
        />
      )}

      {nestedSource?.kind === 'incident' && (() => {
        const incident = INCIDENTS_BY_ID[nestedSource.id];
        return (
          <Drawer open={!!incident} onClose={() => setNestedSource(null)}>
            {incident && <IncidentDetail i={incident} onClose={() => setNestedSource(null)} onChanged={() => forceRender((v) => v + 1)} />}
          </Drawer>
        );
      })()}
      {nestedSource?.kind === 'barrierFailure' && (() => {
        const barrierFailure = BARRIER_FAILURES_BY_ID[nestedSource.id];
        return (
          <Drawer open={!!barrierFailure} onClose={() => setNestedSource(null)}>
            {barrierFailure && (
              <DrawerPanel title={barrierFailure.controlName} id={barrierFailure.id} fullRecordPath={`/risk/barrier-failures/${barrierFailure.id}`} onClose={() => setNestedSource(null)}>
                <BarrierFailureDetail b={barrierFailure} onChanged={() => forceRender((v) => v + 1)} />
              </DrawerPanel>
            )}
          </Drawer>
        );
      })()}
    </div>
  );
}
