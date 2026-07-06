export type AccessLevel = 'Admin' | 'Manager' | 'Supervisor' | 'Observer';
export type UserStatus = 'active' | 'invited';

export interface User {
  id: string;
  name: string;
  role: string;
  region: string;
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
