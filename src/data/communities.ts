import type { Community, Post, ThreadExtra } from '@/types';

export const COMMUNITIES: Community[] = [
  { id: 'c1', name: 'Hot Works', kind: 'Practice', members: 142, icon: 'local_fire_department' },
  { id: 'c2', name: 'Work at Heights', kind: 'Practice', members: 98, icon: 'health_and_safety' },
  { id: 'c3', name: 'PTW Practice', kind: 'Practice', members: 67, icon: 'assignment' },
  { id: 'c4', name: 'Confined Space', kind: 'Practice', members: 54, icon: 'frame_inspect' },
  { id: 'c5', name: 'NSW Operations', kind: 'Regional', members: 34, icon: 'apartment' },
];

export const POSTS: Post[] = [
  { id: 'p1', kind: 'discussion', author: 'Hiviz', avatar: 'Hv', generated: true, community: 'Hot Works', when: '3h ago', postedAgoMinutes: 180,
    title: 'Spotter handovers breaking at shift change — three near-misses say the same thing',
    body: 'Across four sites in 28 days. Spotter changes at shift change without re-confirmation. The PTW technically requires confirmation at commencement — but shift change isn’t treated as recommencement.',
    replies: 4, likes: 23, files: 1, fileName: 'Spotter-handover-checklist-v2.pdf' },
  { id: 'p5', kind: 'poll', author: 'M. Ahn', role: 'Safety Coordinator', community: 'Work at Heights', when: '5h ago', postedAgoMinutes: 300,
    title: 'Which anchor point layout do you use for confined roof work?',
    body: 'Comparing setups across sites before we standardise the toolbox talk.',
    pollOptions: [
      { label: 'Fixed rail system', votes: 19 },
      { label: 'Portable davit arm', votes: 12 },
      { label: 'Horizontal lifeline', votes: 7 },
    ],
    replies: 3, likes: 9 },
  { id: 'p6', kind: 'briefing', author: 'Hiviz', avatar: 'Hv', community: 'Confined Space', when: '7h ago', postedAgoMinutes: 420,
    title: 'Updated confined-space entry permit — mandatory acknowledgement',
    body: 'New atmospheric testing requirement added to the PTW template. Review before your next confined-space job.',
    replies: 2, likes: 41, files: 1, fileName: 'Confined-Space-Entry-Permit-v3.pdf' },
  { id: 'p7', kind: 'briefing', author: 'Hiviz', avatar: 'Hv', community: 'NSW Operations', when: '1h ago', postedAgoMinutes: 60,
    title: 'Regional heat policy update — effective this Friday',
    body: 'New minimum hydration-break intervals for NSW sites above 35°C. Site-level heat plans still apply on top of this.',
    replies: 2, likes: 22 },
  { id: 'p8', kind: 'discussion', author: 'K. Lee', role: 'Crew Lead', community: 'PTW Practice', when: '15h ago', postedAgoMinutes: 900,
    title: 'Anyone digitised their PTW handover log yet?',
    body: 'Still running paper-based shift handovers for permits — looking at options before EOFY.',
    replies: 2, likes: 12 },
  { id: 'p2', kind: 'discussion', author: 'P. Torres', community: 'Work at Heights', role: 'Supervisor', when: '1d ago', postedAgoMinutes: 1440,
    title: 'Split-watch setup for confined-area hot work — anyone done this?',
    body: 'Trialling a split-watch on confined-area hot work. Keen to hear how others have structured the fire-watch rotation.',
    replies: 3, likes: 11 },
  { id: 'p3', kind: 'discussion', author: 'R. Bridges', community: 'PTW Practice', role: 'EHS Manager', when: '1d ago', postedAgoMinutes: 1460, digest: true,
    title: '24-hour permit cycles in confined spaces — what does yours say?',
    body: 'Pulling together a digest on permit validity windows. Drop your site’s rule and we’ll compare.',
    replies: 31, likes: 54 },
  { id: 'p4', kind: 'discussion', author: 'A. Muñoz', community: 'Confined Space', role: 'EHS Lead', when: '2d ago', postedAgoMinutes: 2880,
    title: 'Added a shift-change checklist to the PTW — happy to share the template',
    body: 'Re-confirm spotter boundaries at every handover. Cut our near-misses to zero last quarter.',
    replies: 6, likes: 9, files: 1, fileName: 'Shift-Change-Checklist.pdf' },
];

export const THREADS: Record<string, ThreadExtra> = {
  p1: {
    question: 'When does your PTW actually confirm the spotter knows their boundaries — and what happens when they walk off?',
    replies: [
      { name: 'P. Torres', role: 'Supervisor · Sydney', when: '2h ago', text: 'Same issue. PTW says confirmed but no re-confirmation after handover. Gap in form design as much as procedure.', likes: 8 },
      { name: 'A. Muñoz', role: 'EHS Lead · Perth', when: '2h ago', text: 'We added a shift-change checklist to the PTW — re-confirm spotter boundaries at every handover. Cut our near-misses to zero last quarter.', likes: 5 },
      { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '1h ago', text: 'Worth making this a standing item in the permit. Happy to take it to the PTW Practice group.', likes: 3 },
      { name: 'D. Whitlock', role: 'Crew Lead · Coolinga', when: '45m ago', text: 'Saw the same handover gap on dozer 4 last roster.', likes: 2 },
    ],
  },
  p5: {
    replies: [
      { name: 'K. Lee', role: 'Crew Lead · Sylvania', when: '4h ago', text: 'We run fixed rail on the conveyor gantry, davit arm everywhere else.', likes: 6 },
      { name: 'P. Singh', role: 'HSE Lead', when: '3h ago', text: 'Horizontal lifeline only where structural won’t take a rail — otherwise fixed rail every time.', likes: 4 },
      { name: 'A. Pereira', role: 'Supervisor · Ridgeback', when: '2h ago', text: 'Portable davit arm has been a pain to recertify every 6 months — moving to fixed rail next shutdown.', likes: 3 },
    ],
  },
  p6: {
    replies: [
      { name: 'M. Okafor', role: 'Crew Lead · Jewell', when: '5h ago', text: 'Does the new atmospheric test apply retroactively to permits issued this week?', likes: 3 },
      { name: 'A. Muñoz', role: 'EHS Lead · Perth', when: '4h ago', text: 'Yes — supervisors are re-testing anything still open past today.', likes: 5 },
    ],
  },
  p7: {
    replies: [
      { name: 'J. Liang', role: 'Supervisor · Coolinga', when: '40m ago', text: 'Does this override the site-level heat plan or sit alongside it?', likes: 2 },
      { name: 'Hiviz', role: 'Regional EHS', when: '25m ago', text: 'Alongside — site plans still apply, this sets the regional minimum.', likes: 6 },
    ],
  },
  p8: {
    replies: [
      { name: 'A. Muñoz', role: 'EHS Lead · Perth', when: '10h ago', text: 'We scan the paper log at end of shift — saves the chase for it during audits.', likes: 5 },
      { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '8h ago', text: 'Doing the same, keen to move it fully digital next quarter.', likes: 3 },
    ],
  },
  p2: {
    replies: [
      { name: 'K. Lee', role: 'Crew Lead · Sylvania', when: '20h ago', text: 'We run two watchers on a 30-minute rotation, logged on the permit.', likes: 4 },
      { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '18h ago', text: 'Same, plus a radio check every 15. Slower rotation and people lose focus.', likes: 6 },
      { name: 'M. Ahn', role: 'Safety Coordinator', when: '14h ago', text: 'Following this — keen to compare against our anchor point poll too.', likes: 2 },
    ],
  },
  p3: {
    replies: [
      { name: 'D. Cole', role: 'Supervisor · Marlow', when: '22h ago', text: '24 hours here, resets at midnight regardless of entry time.', likes: 9 },
      { name: 'A. Patel', role: 'Crew Lead · Northgate', when: '20h ago', text: 'Same 24h window, but we tie it to shift start not midnight.', likes: 7 },
      { name: 'J. Liang', role: 'Supervisor · Coolinga', when: '16h ago', text: '12 hours for us — anything past that needs a fresh gas test logged.', likes: 11 },
      { name: 'P. Torres', role: 'Supervisor · Sydney', when: '10h ago', text: '12h window here too, mirrors J. Liang’s site.', likes: 5 },
    ],
  },
  p4: {
    replies: [
      { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '1d ago', text: 'Took this template — rolling out at Brookman next roster.', likes: 4 },
      { name: 'K. Lee', role: 'Crew Lead · Sylvania', when: '1d ago', text: 'Same, small tweak: we added a photo of the board to the log.', likes: 3 },
    ],
  },
};
