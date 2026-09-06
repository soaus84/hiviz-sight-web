import { colors } from '@/tokens';
import { Avatar, Badge } from '@/components';
import { STOP_WORK_STATUS_DISPLAY, SEVERITY_DISPLAY } from './incidentDisplay';
import type { StopWorkEvent } from '@/types';

export interface StopWorkCardProps {
  e: StopWorkEvent;
  onClick: () => void;
  selected?: boolean;
}

export function StopWorkCard({ e, onClick, selected }: StopWorkCardProps) {
  const status = STOP_WORK_STATUS_DISPLAY[e.status];
  const severity = SEVERITY_DISPLAY[e.severityClass];
  const person = e.requestedBy || e.confirmedBy || e.resumedBy;

  return (
    <div
      onClick={onClick}
      className="a-card-int"
      style={{ background: colors.panel, border: `1px solid ${selected ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: selected ? 'var(--shadow-rail)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        {e.siteWide && <Badge tone="error" outline>Site-wide</Badge>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{severity.label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{e.workType}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
        {person && <Avatar name={person} size={22} ring />}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{e.siteName} · {e.sourceId}</span>
      </div>
    </div>
  );
}
