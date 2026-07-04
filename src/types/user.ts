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
  region: string;
  email: string;
}
