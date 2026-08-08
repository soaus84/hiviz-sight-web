import type { CurrentUser } from '@/types';

/**
 * The people you can preview the app as. Jordan Marsh is a pure regional
 * manager (region pinned, no division) — Renee Castillo is a dual-purview
 * manager (both region AND division pinned), to demonstrate that the
 * combination is an individual's assignment, not an org-level tier of its
 * own: her purview (Pilbara ∩ Gold) is a strict, meaningfully smaller subset
 * than either axis alone. Jordan is additionally flagged isAdmin — he's
 * already Admin access level in the separate Users & access roster
 * (data/users.ts), so this is the same person's admin standing, not an
 * arbitrary pick — giving him visibility into the Admin workspace on top of
 * his regional purview.
 */
export const SWITCHABLE_USERS: CurrentUser[] = [
  // c-hrw-hrw20 = Hot work, c-sp-sp8 = Permit to work, c-hrw-hrw32 = Work at heights, c-hrw-hrw3 = Confined spaces
  { name: 'Jordan Marsh', initials: 'JM', role: 'Region Manager', region: 'Pilbara', email: 'j.marsh@hiviz.io', isAdmin: true, joinedCommunityIds: ['c-hrw-hrw20', 'c-sp-sp8'] },
  { name: 'Renee Castillo', initials: 'RC', role: 'Divisional Manager — Gold', region: 'Pilbara', division: 'Gold', subdivision: 'Open Pit', email: 'r.castillo@hiviz.io', joinedCommunityIds: ['c-hrw-hrw32', 'c-hrw-hrw3'] },
];

export const CURRENT_USER: CurrentUser = SWITCHABLE_USERS[0];
