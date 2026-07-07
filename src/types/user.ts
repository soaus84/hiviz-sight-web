export type AccessLevel = 'Admin' | 'Manager' | 'Supervisor' | 'Observer';
export type UserStatus = 'active' | 'invited';

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
  email: string;
}
