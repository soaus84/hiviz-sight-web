export type CommunityKind = 'Practice' | 'Regional';

export interface Community {
  id: string;
  name: string;
  kind: CommunityKind;
  members: number;
  icon: string;
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
