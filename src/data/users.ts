import type { User } from '@/types';

export const USERS: User[] = [
  { id: 'u1', name: 'Jordan Marsh', role: 'Region Manager', region: 'Pilbara', access: 'Admin', sitesCount: 7, lastActive: 'Online now', status: 'active' },
  { id: 'u2', name: 'Priya Singh', role: 'HSE Lead', region: 'Pilbara', access: 'Manager', sitesCount: 4, lastActive: '12m ago', status: 'active' },
  { id: 'u3', name: 'James Morrow', role: 'Site Supervisor', region: 'Pilbara', access: 'Supervisor', sitesCount: 1, lastActive: '1h ago', status: 'active' },
  { id: 'u4', name: 'Kim Lee', role: 'Crew Lead', region: 'Kalgoorlie', access: 'Observer', sitesCount: 1, lastActive: '3h ago', status: 'active' },
  { id: 'u5', name: 'Jess Liang', role: 'Safety Advisor', region: 'Goldfields', access: 'Manager', sitesCount: 3, lastActive: 'Yesterday', status: 'active' },
  { id: 'u6', name: 'Marcus Okafor', role: 'Site Supervisor', region: 'Pilbara', access: 'Supervisor', sitesCount: 1, lastActive: '2 days ago', status: 'invited' },
];
