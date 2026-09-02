import { colors } from '@/tokens';
import { Avatar, Badge } from '@/components';
import { INCIDENT_STATUS_DISPLAY, SEVERITY_DISPLAY } from './incidentDisplay';
import type { Incident } from '@/types';

/** The review-stage twin of InvestigationCard — same shell, so a severe
 * incident awaiting triage and an open/closed investigation read as the same
 * kind of thing in the list/board, which is the point: they're two stages of
 * one pipeline, not two unrelated entities. */
export interface SevereIncidentCardProps {
  i: Incident;
  onClick: () => void;
  selected?: boolean;
}

export function SevereIncidentCard({ i, onClick, selected }: SevereIncidentCardProps) {
  const status = INCIDENT_STATUS_DISPLAY.severe;
  const severity = SEVERITY_DISPLAY[i.severityClass];
  return (
    <div
      onClick={onClick}
      className="a-card-int"
      style={{ background: colors.panel, border: `1px solid ${selected ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: selected ? 'var(--shadow-rail)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <Badge tone={status.tone}>Needs review</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{severity.label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{i.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
        <Avatar name={i.reporterName} size={22} ring />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{i.siteName} · {i.when}</span>
      </div>
    </div>
  );
}
