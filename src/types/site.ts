export type Visibility = 'high' | 'moderate' | 'low';
export type AtrophyState = null | 'active' | 'elevated' | 'critical';

export interface Site {
  id: string;
  name: string;
  region: string;
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
}
