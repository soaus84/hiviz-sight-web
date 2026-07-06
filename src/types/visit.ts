export type VisitState = 'live' | 'upcoming' | 'past';
export type BriefingStatus = 'ready' | 'pending';

export interface SignalCounts {
  pos: number;
  weak: number;
  barrier: number;
}

export interface Visit {
  id: string;
  siteName: string;
  region: string;
  division: string;
  visitor: string;
  when: string;
  date: string;
  time?: string;
  state: VisitState;
  elapsed?: string;
  observationCount: number;
  signals?: SignalCounts;
  briefing?: BriefingStatus;
  ledToInsight?: boolean;
  focusNotes?: string;
  relatedInsightIds?: string[];
}
