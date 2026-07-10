import { colors } from '@/tokens';
import { SchematicMap, type MapPin } from '@/views/shared/SchematicMap';
import type { Site, Visibility } from '@/types';

// Matches the Visibility badge tones on the Sites table (VIZ_TONE in
// Sites.tsx) so a site reads the same way whether you're looking at the
// list or the map.
const VIZ_DOT: Record<Visibility, string> = { high: colors.green, moderate: colors.amber, low: colors.red };

/** Every site in the current filter/search gets a labeled, clickable pin —
 * unlike VisitsMap there's no separate "dim background" layer, since the
 * Sites view already is the full site list. See SchematicMap for why this
 * is a hand-placed schematic rather than a real map. */
export function SitesMap({ sites, onSelect }: { sites: Site[]; onSelect: (id: string) => void }) {
  const pins: MapPin[] = sites
    .filter((s) => s.mapX != null && s.mapY != null)
    .map((s) => ({ id: s.id, x: s.mapX!, y: s.mapY!, label: s.name, tone: VIZ_DOT[s.visibility], pulse: s.live }));

  return <SchematicMap pins={pins} onSelect={onSelect} />;
}
