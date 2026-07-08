import type { Contact } from '@/types';
import { SITES } from './sites';

function emailFor(name: string) {
  return name.replace(/\./g, '').split(' ').filter(Boolean).join('.').toLowerCase() + '@hiviz.io';
}

export const CONTACTS_BY_SITE: Record<string, Contact[]> = Object.fromEntries(
  SITES.map((s) => [
    s.id,
    [
      // role is deliberately one of exactly two values — Work supervisor or
      // Safety advisor — so the role badge in the profile drawer header
      // never needs to vary its tone per role (see ContactDetail).
      {
        id: `${s.id}-supervisor`,
        name: s.supervisor,
        role: 'Work supervisor',
        primary: true,
        status: s.live ? 'On site now' : 'Off site',
        shift: 'Day shift · 06:00 → 18:00',
        phone: '+61 408 552 117',
        radioChannel: 'Channel 4 · Site Ops',
        email: emailFor(s.supervisor),
      },
      {
        id: `${s.id}-crewlead`,
        name: 'Kim Lee',
        role: 'Work supervisor',
        status: 'On site now',
        shift: 'Day shift · 06:00 → 18:00',
        phone: '+61 412 998 214',
        radioChannel: 'Channel 2 · Crew',
        email: emailFor('Kim Lee'),
      },
      {
        id: `${s.id}-hse`,
        name: 'Priya Singh',
        role: 'Safety advisor',
        status: 'Off site',
        phone: '+61 433 771 052',
        email: emailFor('Priya Singh'),
      },
    ] satisfies Contact[],
  ]),
);
