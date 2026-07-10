export type Visibility = 'high' | 'moderate' | 'low';
export type AtrophyState = null | 'active' | 'elevated' | 'critical';

export interface Contact {
  id: string;
  name: string;
  role: string;
  primary?: boolean;
  status: string;
  shift?: string;
  phone: string;
  radioChannel?: string;
  email: string;
}

export interface Site {
  id: string;
  name: string;
  region: string;
  division: string;
  type: string;
  visibility: Visibility;
  visibilityLabel: string;
  lastVisit: string;
  lastVisitDays: number;
  openInsightsCount: number;
  observationsCount: number;
  atrophyScore: number | null;
  status: string;
  live?: boolean;
  risk?: boolean;
  needsVisit?: boolean;
  supervisor: string;
  crewSize: number;
  /** Position on the schematic (non-geographic) regional map, as a 0-100
   * percentage of the map canvas — not real coordinates, this app has no
   * mapping API/key. Optional since not every future site needs to be
   * placed on the map immediately. */
  mapX?: number;
  mapY?: number;
}
