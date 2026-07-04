export type CommunityKind = 'Practice' | 'Regional';

export interface Community {
  id: string;
  name: string;
  kind: CommunityKind;
  members: number;
  icon: string;
}

export interface Post {
  id: string;
  author: string;
  avatar?: string;
  generated?: boolean;
  community: string;
  when: string;
  title: string;
  body: string;
  replies: number;
  likes: number;
  files?: number;
  role?: string;
  digest?: boolean;
}

export interface ThreadReply {
  name: string;
  role: string;
  when: string;
  text: string;
  likes: number;
}

export interface Thread {
  post: Post;
  question: string;
  replies: ThreadReply[];
}
