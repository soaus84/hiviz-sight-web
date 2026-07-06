import type { CurrentUser } from '@/types';

/**
 * The people you can preview the app as. Jordan Marsh is a pure regional
 * manager (region pinned, no division) — Renee Castillo is a dual-purview
 * manager (both region AND division pinned), to demonstrate that the
 * combination is an individual's assignment, not an org-level tier of its
 * own: her purview (Pilbara ∩ Gold) is a strict, meaningfully smaller subset
 * than either axis alone.
 */
export const SWITCHABLE_USERS: CurrentUser[] = [
  { name: 'Jordan Marsh', initials: 'JM', role: 'Region Manager', region: 'Pilbara', email: 'j.marsh@hiviz.io' },
  { name: 'Renee Castillo', initials: 'RC', role: 'Divisional Manager — Gold', region: 'Pilbara', division: 'Gold', email: 'r.castillo@hiviz.io' },
];

export const CURRENT_USER: CurrentUser = SWITCHABLE_USERS[0];
