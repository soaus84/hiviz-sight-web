import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Tabs, Btn, Avatar, SChip, Icon } from '@/components';
import { INSIGHTS, INSIGHTS_BY_ID } from '@/data/insights';
import { InsightDetail } from './InsightDetail';
import type { InsightStatus } from '@/types';

const STATUS: Record<InsightStatus, [string, string]> = {
  review: ['Awaiting support', colors.amber],
  action: ['In action', colors.hiInk],
  closed: ['Closed', colors.green],
};

const VALID_TABS: InsightStatus[] = ['review', 'action', 'closed'];
function isInsightStatus(v: string | null): v is InsightStatus {
  return !!v && (VALID_TABS as string[]).includes(v);
}

export function Insights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const breakpoint = useBreakpoint();

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

  const counts = {
    review: INSIGHTS.filter((i) => i.status === 'review').length,
    action: INSIGHTS.filter((i) => i.status === 'action').length,
    closed: INSIGHTS.filter((i) => i.status === 'closed').length,
  };
  const list = useMemo(() => INSIGHTS.filter((i) => i.status === tab), [tab]);

  useEffect(() => {
    if (!list.find((i) => i.id === selId)) setSelId(list[0]?.id ?? null);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = INSIGHTS.find((i) => i.id === selId);

  const setTab = (k: string) => {
    setTabState(k as InsightStatus);
    setParams(k === 'review' ? {} : { tab: k }, { replace: true });
    if (id) navigate('/insights', { replace: true });
  };

  const selectCard = (cardId: string) => {
    setSelId(cardId);
    navigate(`/insights/${cardId}`, { replace: true });
  };

  const showList = breakpoint !== 'mobile' || !sel;
  const showDetail = breakpoint !== 'mobile' || !!sel;
  const gridCols = breakpoint === 'desktop' ? '360px 1fr' : '1fr';

  return (
    <div>
      {breakpoint === 'mobile' && sel ? (
        <button onClick={() => { setSelId(null); navigate('/insights'); }} className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          <Icon name="arrow_back" size={16} /> All insights
        </button>
      ) : (
        <>
          <PageHead title="Insights" sub="Cross-site patterns Hiviz has surfaced from the field. Review, support and route them to action." actions={<Btn variant="ghost" icon="download">Report</Btn>} />
          <Tabs value={tab} onChange={setTab} items={[{ k: 'review', label: 'For review', n: counts.review }, { k: 'action', label: 'In action', n: counts.action }, { k: 'closed', label: 'Closed', n: counts.closed }]} />
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
        {showList && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((i) => {
              const on = i.id === selId;
              const [sl, sh] = STATUS[i.status];
              return (
                <div
                  key={i.id}
                  onClick={() => selectCard(i.id)}
                  className="a-card-int"
                  style={{ background: colors.panel, border: `1px solid ${on ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: on ? 'var(--shadow-rail)' : 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <SChip hue={sh}>{sl}</SChip>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.theme}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{i.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
                    <div style={{ display: 'flex' }}>
                      {i.supporterInitials.slice(0, 3).map((sp, k) => <div key={k} style={{ marginLeft: k ? -7 : 0 }}><Avatar name={sp} size={22} ring /></div>)}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{i.observationCount} obs · {i.siteNames.length} site{i.siteNames.length > 1 ? 's' : ''}</span>
                    {i.routed && <span style={{ marginLeft: 'auto' }}><Icon name="auto_awesome" size={15} color={colors.hiInk} fill={1} /></span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showDetail && sel && <InsightDetail i={sel} />}
      </div>
    </div>
  );
}
