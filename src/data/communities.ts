import type { Community, Post, Thread } from '@/types';

export const COMMUNITIES: Community[] = [
  { id: 'c1', name: 'Hot Works', kind: 'Practice', members: 142, icon: 'local_fire_department' },
  { id: 'c2', name: 'Work at Heights', kind: 'Practice', members: 98, icon: 'health_and_safety' },
  { id: 'c3', name: 'PTW Practice', kind: 'Practice', members: 67, icon: 'assignment' },
  { id: 'c4', name: 'Confined Space', kind: 'Practice', members: 54, icon: 'frame_inspect' },
  { id: 'c5', name: 'NSW Operations', kind: 'Regional', members: 34, icon: 'apartment' },
];

export const POSTS: Post[] = [
  { id: 'p1', author: 'Hiviz', avatar: 'Hv', generated: true, community: 'Hot Works', when: '3h ago',
    title: 'Spotter handovers breaking at shift change — three near-misses say the same thing',
    body: 'Across four sites in 28 days. Spotter changes at shift change without re-confirmation. The PTW technically requires confirmation at commencement — but shift change isn’t treated as recommencement.',
    replies: 14, likes: 23, files: 1 },
  { id: 'p2', author: 'P. Torres', community: 'Work at Heights', role: 'Supervisor', when: '1d ago',
    title: 'Split-watch setup for confined-area hot work — anyone done this?',
    body: 'Trialling a split-watch on confined-area hot work. Keen to hear how others have structured the fire-watch rotation.',
    replies: 8, likes: 11 },
  { id: 'p3', author: 'R. Bridges', community: 'PTW Practice', role: 'EHS Manager', when: '1d ago', digest: true,
    title: '24-hour permit cycles in confined spaces — what does yours say?',
    body: 'Pulling together a digest on permit validity windows. Drop your site’s rule and we’ll compare.',
    replies: 31, likes: 54 },
  { id: 'p4', author: 'A. Muñoz', community: 'Confined Space', role: 'EHS Lead', when: '2d ago',
    title: 'Added a shift-change checklist to the PTW — happy to share the template',
    body: 'Re-confirm spotter boundaries at every handover. Cut our near-misses to zero last quarter.',
    replies: 6, likes: 9, files: 1 },
];

export const THREAD: Thread = {
  post: POSTS[0],
  question: 'When does your PTW actually confirm the spotter knows their boundaries — and what happens when they walk off?',
  replies: [
    { name: 'P. Torres', role: 'Supervisor · Sydney', when: '2h ago', text: 'Same issue. PTW says confirmed but no re-confirmation after handover. Gap in form design as much as procedure.', likes: 8 },
    { name: 'A. Muñoz', role: 'EHS Lead · Perth', when: '2h ago', text: 'We added a shift-change checklist to the PTW — re-confirm spotter boundaries at every handover. Cut our near-misses to zero last quarter.', likes: 5 },
    { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '1h ago', text: 'Worth making this a standing item in the permit. Happy to take it to the PTW Practice group.', likes: 3 },
  ],
};
