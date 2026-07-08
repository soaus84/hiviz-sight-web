import type { User } from '@/types';

// role is deliberately one of exactly two values — Safety Manager or
// Business Manager — so the role badge in the profile drawer header never
// needs to vary its tone per role (see MemberDetail).
export const USERS: User[] = [
  { id: 'u1', name: 'Jordan Marsh', role: 'Business Manager', region: 'Pilbara', access: 'Admin', sitesCount: 7, lastActive: 'Online now', status: 'active' },
  { id: 'u2', name: 'Priya Singh', role: 'Safety Manager', region: 'Pilbara', access: 'Manager', sitesCount: 4, lastActive: '12m ago', status: 'active' },
  { id: 'u3', name: 'James Morrow', role: 'Safety Manager', region: 'Pilbara', division: 'Iron Ore', access: 'Supervisor', sitesCount: 1, lastActive: '1h ago', status: 'active' },
  { id: 'u4', name: 'Kim Lee', role: 'Business Manager', region: 'Kalgoorlie', division: 'Gold', access: 'Observer', sitesCount: 1, lastActive: '3h ago', status: 'active' },
  { id: 'u5', name: 'Jess Liang', role: 'Safety Manager', region: 'Goldfields', division: 'Gold', access: 'Manager', sitesCount: 3, lastActive: 'Yesterday', status: 'active' },
  { id: 'u6', name: 'Marcus Okafor', role: 'Safety Manager', region: 'Pilbara', division: 'Gold', access: 'Supervisor', sitesCount: 1, lastActive: '2 days ago', status: 'invited' },
];

export interface UserInput {
  name: string;
  role: string;
  region: string;
  division?: string;
  access: User['access'];
}

export function addUser(input: UserInput): User {
  const user: User = { id: `u${USERS.length + 1}-${Date.now()}`, ...input, sitesCount: 0, lastActive: 'Never', status: 'invited' };
  USERS.push(user);
  return user;
}

export function updateUser(id: string, input: UserInput): User | null {
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  USERS[idx] = { ...USERS[idx], ...input };
  return USERS[idx];
}

export function removeUser(id: string): void {
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx !== -1) USERS.splice(idx, 1);
}
