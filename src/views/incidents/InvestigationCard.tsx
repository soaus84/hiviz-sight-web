import { colors } from '@/tokens';
import { Avatar, Badge, Icon } from '@/components';
import { SEVERITY_DISPLAY, INVESTIGATION_STATUS_DISPLAY } from './incidentDisplay';
import type { Investigation } from '@/types';

export interface InvestigationCardProps {
  v: Investigation;
  onClick: () => void;
  selected?: boolean;
}

export function InvestigationCard({ v, onClick, selected }: InvestigationCardProps) {
  const status = INVESTIGATION_STATUS_DISPLAY[v.status];
  const severity = SEVERITY_DISPLAY[v.severityClass];
  return (
    <div
      onClick={onClick}
      className="a-card-int"
      style={{ background: colors.panel, border: `1px solid ${selected ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: selected ? 'var(--shadow-rail)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{severity.label}</span>
        {v.legalHold && <Icon name="lock" size={14} color={colors.red} />}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{v.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
        {v.investigatorName && <Avatar name={v.investigatorName} size={22} ring />}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{v.incidentCount} incident{v.incidentCount > 1 ? 's' : ''} · {v.siteNames.length} site{v.siteNames.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
