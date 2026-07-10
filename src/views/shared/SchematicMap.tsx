import { colors } from '@/tokens';
import { Dot } from '@/components';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface MapPoint {
  id: string;
  x: number;
  y: number;
}

export interface MapPin extends MapPoint {
  label: string;
  tone: string;
  pulse?: boolean;
}

// Loose regional groupings for the map's labels — not a real map
// projection, just enough spatial spread that the schematic reads as "a
// map" rather than a random scatter. Matches the mapX/mapY hand-placed on
// each Site.
const REGION_LABELS = [
  { name: 'Pilbara', x: 27, y: 6 },
  { name: 'Goldfields', x: 61, y: 51 },
  { name: 'Kalgoorlie', x: 76, y: 78 },
];

/** A schematic (non-geographic) regional map, shared by VisitsMap and
 * SitesMap — this app has no mapping API/key, so positions are hand-placed
 * percentages on a plain canvas rather than real coordinates on real map
 * tiles. `dimPoints` renders as small muted context dots (no label, no
 * click); `pins` renders as labeled, clickable, tone-colored markers on
 * top of them.
 *
 * No overflow clipping — a pin label sitting close to y:0 needs room to
 * render above its dot without getting truncated by the panel edge, and a
 * flat fill background doesn't need clipping to look tidy anyway. Mobile
 * gets a taller aspect ratio since the same handful of sites need more
 * vertical room once the panel is only ~340px wide. */
export function SchematicMap({ pins, dimPoints, onSelect }: { pins: MapPin[]; dimPoints?: MapPoint[]; onSelect: (id: string) => void }) {
  const breakpoint = useBreakpoint();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: breakpoint === 'mobile' ? '4 / 5' : '16 / 9',
        background: colors.fill,
        border: `1px solid ${colors.rule}`,
        borderRadius: 'var(--radius-xl)',
      }}
    >
      {REGION_LABELS.map((r) => (
        <span
          key={r.name}
          style={{
            position: 'absolute',
            left: `${r.x}%`,
            top: `${r.y}%`,
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.inkMuted,
          }}
        >
          {r.name}
        </span>
      ))}

      {dimPoints?.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 6,
            height: 6,
            borderRadius: 99,
            background: colors.inkMuted,
          }}
        />
      ))}

      {pins.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          title={p.label}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0 0 6px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11.5,
              fontWeight: 700,
              color: colors.ink,
              background: colors.panel,
              border: `1px solid ${colors.rule}`,
              borderRadius: 6,
              padding: '3px 8px',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {p.label}
          </span>
          <Dot tone={p.tone} size={11} pulse={p.pulse} />
        </button>
      ))}
    </div>
  );
}
