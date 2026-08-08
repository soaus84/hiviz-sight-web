export type CommunityKind = 'Org' | 'HighRiskWork' | 'SafetyPractice' | 'Regional';

export type OrgLevel = 'company' | 'division' | 'subdivision';

export interface Community {
  id: string;
  name: string;
  kind: CommunityKind;
  members: number;
  icon: string;
  /** Org-level communities (kind: 'Org') mirror the Company/Division/
   * Subdivision hierarchy from the purview model — membership is derived
   * from where a person sits (see isMyCommunity in data/communities.ts),
   * not joined. Undefined for HighRiskWork/SafetyPractice/Regional, which
   * stay opt-in. */
  orgLevel?: OrgLevel;
  division?: string;
  subdivision?: string;
  /** Id of the Admin Taxonomy entry (HIGH_RISK_WORK/SAFETY_PRACTICES) this
   * community was generated from — see data/communities.ts. Undefined for
   * Org/Regional, which aren't taxonomy-derived. */
  taxonomyId?: string;
}

export type PostKind = 'discussion' | 'poll' | 'briefing';

export interface PollOption {
  label: string;
  votes: number;
}

export interface Post {
  id: string;
  kind: PostKind;
  author: string;
  avatar?: string;
  generated?: boolean;
  community: string;
  when: string;
  postedAgoMinutes: number;
  title: string;
  body: string;
  replies: number;
  likes: number;
  files?: number;
  fileName?: string;
  role?: string;
  digest?: boolean;
  pollOptions?: PollOption[];
}

export interface ThreadReply {
  name: string;
  role: string;
  when: string;
  text: string;
  likes: number;
}

export interface ThreadExtra {
  question?: string;
  replies: ThreadReply[];
}
