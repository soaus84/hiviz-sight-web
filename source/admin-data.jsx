// admin-data.jsx — sample data for the desktop console. Mirrors the names,
// themes and signals used across the mobile prototype so the two read as the
// same product. All global; consumed by the view files.

const CURRENT_USER = { name: 'Jordan Marsh', initials: 'JM', role: 'Region Manager', region: 'Pilbara', email: 'j.marsh@hiviz.io' };

const SITES = [
  { id: 's1', name: 'Northgate Open Cut', region: 'Pilbara', type: 'Iron Ore West', viz: 'high', vizLabel: 'High visibility', lastVisit: 'Today', lastVisitDays: 0, insights: 3, observations: 184, atrophy: 28, status: 'On site now', live: true, supervisor: 'J. Morrow', crew: 42 },
  { id: 's2', name: 'Ridgeback Processing', region: 'Newman, WA', type: 'Processing', viz: 'high', vizLabel: 'High visibility', lastVisit: '2 days ago', lastVisitDays: 2, insights: 2, observations: 96, atrophy: 34, status: 'Visit planned', supervisor: 'A. Pereira', crew: 28 },
  { id: 's3', name: 'Marlow Stockyard', region: 'Pilbara', type: 'Logistics', viz: 'high', vizLabel: 'Trending positive', lastVisit: '2 days ago', lastVisitDays: 2, insights: 1, observations: 71, atrophy: 22, status: 'Healthy', supervisor: 'D. Cole', crew: 19 },
  { id: 's4', name: 'Coolinga Plant', region: 'Goldfields', type: 'Processing', viz: 'high', vizLabel: '2 open barriers', lastVisit: '5 days ago', lastVisitDays: 5, insights: 4, observations: 132, atrophy: 41, status: 'At risk', risk: true, supervisor: 'J. Liang', crew: 36 },
  { id: 's5', name: 'Brookman Pit 2', region: 'Pilbara', type: 'Iron Ore East', viz: 'moderate', vizLabel: 'Moderate visibility', lastVisit: '3 weeks ago', lastVisitDays: 21, insights: 2, observations: 54, atrophy: 58, status: 'Needs a visit', needsVisit: true, supervisor: 'R. Bridges', crew: 23 },
  { id: 's6', name: 'Jewell Crusher', region: 'Pilbara', type: 'Processing', viz: 'low', vizLabel: 'Low visibility', lastVisit: '6 weeks ago', lastVisitDays: 42, insights: 1, observations: 31, atrophy: 64, status: 'At risk', risk: true, needsVisit: true, supervisor: 'M. Okafor', crew: 14 },
  { id: 's7', name: 'Sylvania Underground', region: 'Kalgoorlie', type: 'Underground', viz: 'moderate', vizLabel: 'Moderate visibility', lastVisit: '12 days ago', lastVisitDays: 12, insights: 1, observations: 47, atrophy: 35, status: 'Healthy', supervisor: 'K. Lee', crew: 31 },
];

const VISITS = [
  { id: 'v1', site: 'Northgate Open Cut', region: 'Pilbara', visitor: 'Jordan Marsh', when: 'Today · arrived 08:42', date: '2025-05-07', state: 'live', elapsed: '1h 18m', obs: 4, signals: { pos: 1, weak: 2, barrier: 1 } },
  { id: 'v2', site: 'Ridgeback Processing', region: 'Newman, WA', visitor: 'Jordan Marsh', when: 'Thu 8 May · 09:30', date: '2025-05-08', state: 'upcoming', briefing: 'ready', obs: 0 },
  { id: 'v3', site: 'Sylvania Underground', region: 'Kalgoorlie', visitor: 'Priya Singh', when: 'Mon 12 May · 07:00', date: '2025-05-12', state: 'upcoming', briefing: 'pending', obs: 0 },
  { id: 'v4', site: 'Brookman Pit 2', region: 'Pilbara', visitor: 'Jordan Marsh', when: 'Wed 14 May · 06:30', date: '2025-05-14', state: 'upcoming', briefing: 'pending', obs: 0 },
  { id: 'v5', site: 'Northgate Open Cut', region: 'Pilbara', visitor: 'Jordan Marsh', when: 'Mon 5 May', date: '2025-05-05', state: 'past', obs: 6, signals: { pos: 2, weak: 3, barrier: 1 }, ledToInsight: true },
  { id: 'v6', site: 'Ridgeback Processing', region: 'Newman, WA', visitor: 'Jordan Marsh', when: 'Thu 1 May', date: '2025-05-01', state: 'past', obs: 4, signals: { pos: 1, weak: 2, barrier: 1 } },
  { id: 'v7', site: 'Marlow Stockyard', region: 'Pilbara', visitor: 'P. Singh', when: 'Tue 29 Apr', date: '2025-04-29', state: 'past', obs: 5, signals: { pos: 3, weak: 2, barrier: 0 } },
  { id: 'v8', site: 'Coolinga Plant', region: 'Goldfields', visitor: 'J. Liang', when: 'Mon 28 Apr', date: '2025-04-28', state: 'past', obs: 7, signals: { pos: 2, weak: 4, barrier: 1 } },
];

const INSIGHTS = [
  { id: 'INS-2204', status: 'review', theme: 'Heat management', title: 'Heat management plan non-compliance during elevated temperatures',
    summary: 'Heat-plan requirements not applied consistently past threshold temperatures — work continuing without mandatory rest or hydration breaks.',
    sites: ['Coolinga Plant', 'Ridgeback Processing', 'Northgate Open Cut'], obs: 4, supporters: ['KO', 'TM'], energy: ['Thermal', 'barrier_degraded', 'High release'], updated: '18m ago', routed: true,
    cause: 'Temperature monitoring and the trigger to stop work are not clearly assigned during operations — the plan exists but the stop authority is ambiguous in practice.' },
  { id: 'INS-2201', status: 'review', theme: 'Pre-start checks', title: 'Pre-start checks slipping during shift handovers',
    summary: '7 observations in 14 days, concentrated 06:00–07:00 across loader and dozer crews. Coincides with the last roster change.',
    sites: ['Northgate Open Cut', 'Marlow Stockyard', 'Brookman Pit 2'], obs: 7, supporters: ['AP', 'MC', 'SR'], energy: ['Procedural', 'Recurring'], updated: '1h ago' },
  { id: 'INS-2198', status: 'review', theme: 'Spotter positioning', title: 'Spotter positioning at crusher exclusion zones',
    summary: 'Spotters standing inside marked exclusion at the Jewell crusher during truck reversing — 4 observations across 2 shifts.',
    sites: ['Jewell Crusher'], obs: 4, supporters: ['NO', 'JL'], energy: ['Kinetic', 'barrier_absent'], updated: '3h ago' },
  { id: 'INS-2187', status: 'action', theme: 'Tool tethering', title: 'Tool tethering on elevated walkways',
    summary: 'Unsecured tools observed at height on overhead conveyor walkways across two shifts at Coolinga.',
    sites: ['Coolinga Plant'], obs: 6, supporters: ['JL', 'TM'], energy: ['Gravitational'], step: 'SOP update drafted', owner: 'J. Liang · Safety', updated: '5d ago' },
  { id: 'INS-2179', status: 'action', theme: 'Radio discipline', title: 'Radio handoff protocol at shift change',
    summary: 'New 2-minute radio handoff trialled with the loader crew; rolling out site-wide at Northgate.',
    sites: ['Northgate Open Cut'], obs: 5, supporters: ['OS', 'KO'], energy: ['Procedural'], step: 'Rolling out site-wide', owner: 'Ops + Safety', updated: '1w ago' },
  { id: 'INS-2154', status: 'closed', theme: 'Exclusion signage', title: 'Exclusion zone signage refresh',
    summary: 'Faded signage replaced at three zones following manager support.',
    sites: ['Northgate Open Cut'], obs: 8, supporters: ['SS', 'KO', 'TM', 'AP'], energy: ['Procedural'], outcome: 'Signage replaced at 3 zones', owner: 'Site services', updated: '2w ago' },
];

// Rich detail for the selected insight (INS-2204), mirrors the mobile screen.
const INSIGHT_DETAIL = {
  suggested: 'Heat management plan requirements are not being applied consistently during sustained elevated temperatures. Workers are continuing tasks beyond threshold temperatures without mandatory rest or hydration breaks.',
  suggestedBasis: 'Based on 4 observations across Coolinga, Ridgeback and Northgate — all describing work continuing past temperature thresholds. 3 of 4 flagged barrier_degraded on thermal energy.',
  causeBasis: 'Consistent across all 4 observations: work continued because "someone else was supposed to call it."',
  energyNote: 'Control exists but is not functioning as designed — temperature thresholds are not triggering mandatory stops.',
  sourceObs: [
    { q: 'Crew working through 42°C — no rest break called despite plan threshold of 38°C.', site: 'Coolinga Plant', ago: '2d ago' },
    { q: 'Temperature hit 40°C at 11:00. No work stop. Crew continuing ore loading.', site: 'Ridgeback Processing', ago: '4d ago' },
    { q: 'Heat plan referenced at pre-start but no stop authority named for the shift.', site: 'Northgate Open Cut', ago: '6d ago' },
    { q: 'Hydration breaks skipped during 39°C window — production priority cited.', site: 'Coolinga Plant', ago: '9d ago' },
  ],
  fwmap: [
    { factor: 'management_systems', score: '0.84', note: 'The heat plan exists and is referenced, but does not specify who is responsible for calling a work stop — the system content gap is the cause.' },
    { factor: 'operational_management', score: '0.72', note: 'Managers visiting these sites have not identified or actioned the enforcement ambiguity.' },
  ],
  endorsements: [
    { name: 'Kwame Osei', note: 'Saw the same pattern at Blackrock last summer — this needs a system fix, not individual coaching.' },
    { name: 'Tanya Morrow', note: 'Regional heat plan review is overdue — this is the right trigger.' },
  ],
  questions: [
    { q: 'Is the heat-plan threshold posted at the work front?', done: 7 },
    { q: 'Who is named to call the work stop this shift?', done: 4 },
    { q: 'Are rest / hydration breaks logged during elevated temps?', done: 5 },
  ],
  actions: [
    { a: 'Name work-stop authority in the heat plan', done: 3 },
    { a: 'Add a temperature check to the pre-start', done: 6 },
  ],
};

const OBSERVATIONS = [
  { id: 'OB-5821', when: 'Today 09:14', site: 'Northgate Open Cut', observer: 'Jordan Marsh', summary: 'Spotter not in position when an excavator began reversing near the live haul road — work stopped on the radio.', signal: 'barrier', energy: 'Kinetic', status: 'enriched' },
  { id: 'OB-5820', when: 'Today 08:58', site: 'Northgate Open Cut', observer: 'Jordan Marsh', summary: 'Pre-start walked thoroughly, two housekeeping items raised and actioned before shift.', signal: 'positive', energy: 'Procedural', status: 'classified' },
  { id: 'OB-5819', when: 'Today 08:51', site: 'Northgate Open Cut', observer: 'K. Lee', summary: 'Water station undersupplied for the forecast 39°C peak — flagged to crib hut.', signal: 'weak', energy: 'Thermal', status: 'classified' },
  { id: 'OB-5814', when: 'Yest 15:12', site: 'Coolinga Plant', observer: 'J. Liang', summary: 'No shaded break observed at the fuel bay during the afternoon heat window.', signal: 'weak', energy: 'Thermal', status: 'linked' },
  { id: 'OB-5810', when: 'Yest 14:38', site: 'Coolinga Plant', observer: 'D. Whitlock', summary: 'Dozer 4 crew did not rotate at the scheduled hydration break on a 38°C afternoon.', signal: 'barrier', energy: 'Thermal', status: 'linked' },
  { id: 'OB-5807', when: 'Yest 11:02', site: 'Ridgeback Processing', observer: 'A. Pereira', summary: 'Temperature hit 40°C at 11:00 with no work stop — crew continuing ore loading.', signal: 'barrier', energy: 'Thermal', status: 'linked' },
  { id: 'OB-5801', when: '2d ago', site: 'Marlow Stockyard', observer: 'D. Cole', summary: 'Crew stopped work to re-position a spotter before reversing — strong example of stop-work culture.', signal: 'positive', energy: 'Kinetic', status: 'classified' },
  { id: 'OB-5798', when: '2d ago', site: 'Jewell Crusher', observer: 'M. Okafor', summary: 'Spotter standing inside the marked exclusion zone during truck reversing at the crusher.', signal: 'barrier', energy: 'Kinetic', status: 'linked' },
  { id: 'OB-5790', when: '4d ago', site: 'Brookman Pit 2', observer: 'R. Bridges', summary: 'Two pre-starts unsigned at the start of the day shift after handover.', signal: 'weak', energy: 'Procedural', status: 'classified' },
  { id: 'OB-5786', when: '6d ago', site: 'Northgate Open Cut', observer: 'A. Patel', summary: 'Loader pre-start skipped after the shift handover — caught at the 06:42 walkaround.', signal: 'weak', energy: 'Procedural', status: 'classified' },
];

const OBS_SIGNAL = {
  barrier:  { label: 'Barrier', hue: C.red },
  weak:     { label: 'Weak signal', hue: C.amber },
  positive: { label: 'Positive', hue: C.green },
};

const COMMUNITIES = [
  { id: 'c1', name: 'Hot Works', kind: 'Practice', members: 142, icon: 'local_fire_department' },
  { id: 'c2', name: 'Work at Heights', kind: 'Practice', members: 98, icon: 'health_and_safety' },
  { id: 'c3', name: 'PTW Practice', kind: 'Practice', members: 67, icon: 'assignment' },
  { id: 'c4', name: 'Confined Space', kind: 'Practice', members: 54, icon: 'frame_inspect' },
  { id: 'c5', name: 'NSW Operations', kind: 'Regional', members: 34, icon: 'apartment' },
];

const POSTS = [
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

const THREAD = {
  post: POSTS[0],
  question: 'When does your PTW actually confirm the spotter knows their boundaries — and what happens when they walk off?',
  replies: [
    { name: 'P. Torres', role: 'Supervisor · Sydney', when: '2h ago', text: 'Same issue. PTW says confirmed but no re-confirmation after handover. Gap in form design as much as procedure.', likes: 8 },
    { name: 'A. Muñoz', role: 'EHS Lead · Perth', when: '2h ago', text: 'We added a shift-change checklist to the PTW — re-confirm spotter boundaries at every handover. Cut our near-misses to zero last quarter.', likes: 5 },
    { name: 'R. Bridges', role: 'EHS Manager · Newcastle', when: '1h ago', text: 'Worth making this a standing item in the permit. Happy to take it to the PTW Practice group.', likes: 3 },
  ],
};

const NOTIFS = {
  today: [
    { id: 'n1', tone: C.hiInk, chip: 'hi', icon: 'auto_awesome', unread: true, subject: 'Hiviz', verb: 'routed a new cross-site pattern to your pipeline', detail: 'Heat-plan non-compliance — 4 thermal events across 3 sites in 14 days.', when: '18m', to: 'insights' },
    { id: 'n2', tone: C.amber, icon: 'flag', unread: true, subject: 'Pre-start checks slipping', verb: 'needs your support to move to action', detail: '7 observations · Northgate, Marlow, Brookman.', when: '1h', to: 'insights' },
    { id: 'n3', tone: C.ink, icon: 'event', unread: true, subject: 'Ridgeback Processing', verb: 'visit starts in 2 hours', detail: 'Thu 8 · 09:30 — briefing ready.', when: '2h', to: 'visits' },
  ],
  earlier: [
    { id: 'n4', tone: C.green, icon: 'check', subject: 'K. Osei', verb: 'supported your insight for action', detail: 'Spotter positioning at crusher exclusion — now 3 supporting.', when: 'Yest', to: 'insights' },
    { id: 'n5', tone: C.red, icon: 'warning', subject: 'IM-118 corrective action', verb: 'is overdue at Northgate', detail: 'Still unassigned at site level, 3 weeks on.', when: 'Yest', to: 'sites' },
    { id: 'n6', tone: C.ink, icon: 'chat_bubble', subject: 'D. Whitlock', verb: 'replied in a thread you follow', detail: '“Saw the same handover gap on dozer 4 last roster.”', when: 'Tue', to: 'communities' },
  ],
};
const NOTIF_UNREAD = NOTIFS.today.filter((n) => n.unread).length;

const USERS = [
  { id: 'u1', name: 'Jordan Marsh', role: 'Region Manager', region: 'Pilbara', access: 'Admin', sites: 7, lastActive: 'Online now', status: 'active' },
  { id: 'u2', name: 'Priya Singh', role: 'HSE Lead', region: 'Pilbara', access: 'Manager', sites: 4, lastActive: '12m ago', status: 'active' },
  { id: 'u3', name: 'James Morrow', role: 'Site Supervisor', region: 'Pilbara', access: 'Supervisor', sites: 1, lastActive: '1h ago', status: 'active' },
  { id: 'u4', name: 'Kim Lee', role: 'Crew Lead', region: 'Kalgoorlie', access: 'Observer', sites: 1, lastActive: '3h ago', status: 'active' },
  { id: 'u5', name: 'Jess Liang', role: 'Safety Advisor', region: 'Goldfields', access: 'Manager', sites: 3, lastActive: 'Yesterday', status: 'active' },
  { id: 'u6', name: 'Marcus Okafor', role: 'Site Supervisor', region: 'Pilbara', access: 'Supervisor', sites: 1, lastActive: '2 days ago', status: 'invited' },
];

Object.assign(window, { CURRENT_USER, SITES, VISITS, INSIGHTS, INSIGHT_DETAIL, OBSERVATIONS, OBS_SIGNAL, COMMUNITIES, POSTS, THREAD, NOTIFS, NOTIF_UNREAD, USERS });
