import type { Contact } from '@/types';
import { SITES } from './sites';

function emailFor(name: string) {
  return name.replace(/\./g, '').split(' ').filter(Boolean).join('.').toLowerCase() + '@hiviz.io';
}

export const CONTACTS_BY_SITE: Record<string, Contact[]> = Object.fromEntries(
  SITES.map((s) => [
    s.id,
    [
      {
        id: `${s.id}-supervisor`,
        name: s.supervisor,
        role: 'Site supervisor',
        primary: true,
        status: s.live ? 'On site now' : 'Off site',
        shift: 'Day shift · 06:00 → 18:00',
        phone: '+61 408 552 117',
        radioChannel: 'Channel 4 · Site Ops',
        email: emailFor(s.supervisor),
      },
      {
        id: `${s.id}-crewlead`,
        name: 'K. Lee',
        role: 'Crew lead · day shift',
        status: 'On site now',
        shift: 'Day shift · 06:00 → 18:00',
        phone: '+61 412 998 214',
        radioChannel: 'Channel 2 · Crew',
        email: emailFor('K. Lee'),
      },
      {
        id: `${s.id}-hse`,
        name: 'P. Singh',
        role: 'HSE lead',
        status: 'Off site',
        phone: '+61 433 771 052',
        email: emailFor('P. Singh'),
      },
    ] satisfies Contact[],
  ]),
);
