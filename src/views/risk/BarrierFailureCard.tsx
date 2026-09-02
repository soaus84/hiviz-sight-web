import { colors } from '@/tokens';
import { Avatar, Badge, Icon } from '@/components';
import { BARRIER_FAILURE_STATUS_DISPLAY, SEVERITY_DISPLAY } from './riskDisplay';
import type { BarrierFailure } from '@/types';

export interface BarrierFailureCardProps {
  b: BarrierFailure;
  onClick: () => void;
  selected?: boolean;
}

export function BarrierFailureCard({ b, onClick, selected }: BarrierFailureCardProps) {
  const status = BARRIER_FAILURE_STATUS_DISPLAY[b.status];
  const severity = SEVERITY_DISPLAY[b.severityClass];
  return (
    <div
      onClick={onClick}
      className="a-card-int"
      style={{ background: colors.panel, border: `1px solid ${selected ? colors.ink : colors.rule}`, borderRadius: 'var(--radius-lg)', padding: 15, cursor: 'pointer', boxShadow: selected ? 'var(--shadow-rail)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{severity.label}</span>
        {b.linkedObservationId && <Icon name="hub" size={14} color={colors.inkMuted} />}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{b.controlName}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
        <Avatar name={b.flaggedBy} size={22} ring />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600 }}>{b.siteName} · {b.when}</span>
      </div>
    </div>
  );
}
