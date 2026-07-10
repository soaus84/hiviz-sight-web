import { colors } from '@/tokens';
import { SITES } from '@/data/sites';
import { SchematicMap, type MapPin, type MapPoint } from '@/views/shared/SchematicMap';
import type { Visit } from '@/types';

/** Every site shows as a small muted dot for context; visits in the
 * current tab get a labeled, clickable pin on top of it. See SchematicMap
 * for why this is a hand-placed schematic rather than a real map. */
export function VisitsMap({ visits, onSelect }: { visits: Visit[]; onSelect: (id: string) => void }) {
  const dimPoints: MapPoint[] = SITES.filter((s) => s.mapX != null && s.mapY != null).map((s) => ({ id: s.id, x: s.mapX!, y: s.mapY! }));

  const pins: MapPin[] = visits
    .map((v): MapPin | null => {
      const site = SITES.find((s) => s.name === v.siteName);
      if (site?.mapX == null || site?.mapY == null) return null;
      return { id: v.id, x: site.mapX, y: site.mapY, label: v.siteName, tone: v.state === 'live' ? colors.green : colors.ink, pulse: v.state === 'live' };
    })
    .filter((p): p is MapPin => p !== null);

  return <SchematicMap pins={pins} dimPoints={dimPoints} onSelect={onSelect} />;
}
