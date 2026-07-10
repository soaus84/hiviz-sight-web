import { colors } from '@/tokens';
import { dayParts } from '@/utils/format';

/** The small weekday/day-of-month tile used to lead a visit's row or
 * header — the visit equivalent of a person Avatar or a site's location
 * icon: the one visual that answers "which one is this" at a glance. */
export function VisitDateTile({ date, size = 44 }: { date: string; size?: number }) {
  const { weekday, day } = dayParts(date);
  const compact = size < 44;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: compact ? 8 : 10,
        border: `1px solid ${colors.rule}`,
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: compact ? 8 : 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.inkMuted, lineHeight: 1 }}>
        {weekday}
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: compact ? 14 : 17, fontWeight: 700, color: colors.ink, lineHeight: 1.3 }}>
        {day}
      </span>
    </div>
  );
}
