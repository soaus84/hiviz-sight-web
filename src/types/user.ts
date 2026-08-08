export type AccessLevel = 'Manager' | 'Supervisor' | 'Observer';
export type UserStatus = 'active' | 'invited' | 'revoked';

export interface User {
  id: string;
  name: string;
  role: string;
  region: string;
  /** Home division, when this person's role is division-pinned (e.g. a site
   * supervisor tied to one site's division). Undefined for region-wide roles
   * (Region Manager, HSE Lead) — a division is more often an individual's
   * purview than an organisational constant, so "no pin" is the common case,
   * not a gap. An unpinned member matches any division filter within their
   * region — see memberInPurview in data/leaders.ts. */
  division?: string;
  access: AccessLevel;
  /** Additive — grants access to the Admin workspace on top of whatever
   * access level this person already has (e.g. a Manager can also be an
   * Admin). Not a 4th AccessLevel value: someone doesn't stop being a
   * Manager/Supervisor/Observer by also being an Admin. Same convention as
   * CurrentUser.isAdmin below. */
  isAdmin?: boolean;
  sitesCount: number;
  lastActive: string;
  status: UserStatus;
}

export interface CurrentUser {
  name: string;
  initials: string;
  role: string;
  /** Home region purview. Undefined means no region pin — their purview isn't geography-bound (rare; usually paired with a division pin). */
  region?: string;
  /** Home division purview. Undefined means no division pin — most regional managers don't have one. */
  division?: string;
  /** Home subdivision, when this person's division is further pinned to one
   * of its subdivisions (see data/divisions.ts SUBDIVISIONS). Undefined for
   * anyone without a division pin, or division-wide roles within one.
   * Drives which org-level Community they're auto-associated with in
   * Communities — see isMyCommunity in data/communities.ts. */
  subdivision?: string;
  /** Practice communities (ad-hoc, opt-in — unlike org-level communities,
   * which are auto-derived from region/division/subdivision) this person
   * has joined. See isMyCommunity in data/communities.ts. */
  joinedCommunityIds?: string[];
  email: string;
  /** Additive — grants access to the Admin workspace on top of whatever
   * region/division purview this person already has. Not the same axis as
   * AccessLevel on User (that's per-org-member permissions in Users &
   * access); this is specifically "can this preview persona see Admin". */
  isAdmin?: boolean;
}
