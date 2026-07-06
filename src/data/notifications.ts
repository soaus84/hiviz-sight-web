import { colors } from '@/tokens';
import type { Notification } from '@/types';

export const NOTIFS: { today: Notification[]; earlier: Notification[] } = {
  today: [
    { id: 'n1', tone: colors.hiInk, chip: 'hi', icon: 'lightbulb', unread: true, subject: 'Hiviz', verb: 'routed a new cross-site pattern to your pipeline', detail: 'Heat-plan non-compliance — 4 thermal events across 3 sites in 14 days.', when: '18m', to: 'insights' },
    { id: 'n2', tone: colors.amber, icon: 'flag', unread: true, subject: 'Pre-start checks slipping', verb: 'needs your support to move to action', detail: '7 observations · Northgate, Marlow, Brookman.', when: '1h', to: 'insights' },
    { id: 'n3', tone: colors.ink, icon: 'event', unread: true, subject: 'Ridgeback Processing', verb: 'visit starts in 2 hours', detail: 'Thu 8 · 09:30 — briefing ready.', when: '2h', to: 'visits' },
  ],
  earlier: [
    { id: 'n4', tone: colors.green, icon: 'check', subject: 'K. Osei', verb: 'supported your insight for action', detail: 'Spotter positioning at crusher exclusion — now 3 supporting.', when: 'Yest', to: 'insights' },
    { id: 'n5', tone: colors.red, icon: 'warning', subject: 'IM-118 corrective action', verb: 'is overdue at Northgate', detail: 'Still unassigned at site level, 3 weeks on.', when: 'Yest', to: 'sites' },
    { id: 'n6', tone: colors.ink, icon: 'chat_bubble', subject: 'D. Whitlock', verb: 'replied in a thread you follow', detail: '“Saw the same handover gap on dozer 4 last roster.”', when: 'Tue', to: 'communities' },
  ],
};

export const NOTIF_UNREAD = NOTIFS.today.filter((n) => n.unread).length;
