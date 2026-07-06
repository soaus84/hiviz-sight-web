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
}
