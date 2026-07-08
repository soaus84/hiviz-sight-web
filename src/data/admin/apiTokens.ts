import type { ApiToken } from '@/types';

export const API_TOKENS: ApiToken[] = [
  { id: 'tok1', name: 'Reporting export (BI pipeline)', tokenMasked: 'hvz_live_••••••••a41c', createdAt: '2025-03-12', lastUsed: '2h ago', status: 'active' },
  { id: 'tok2', name: 'Legacy integration (unused)', tokenMasked: 'hvz_live_••••••••7f02', createdAt: '2024-11-02', lastUsed: '3mo ago', status: 'revoked' },
];

function randomToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Returns the full, unmasked token value — the only time it's ever
 * available. Only the masked form (last 4 chars) is stored/displayed after
 * this, matching how real API token creation flows work. */
export function createApiToken(name: string): { token: ApiToken; fullValue: string } {
  const full = `hvz_live_${randomToken()}`;
  const token: ApiToken = {
    id: `tok${API_TOKENS.length + 1}-${Date.now()}`,
    name,
    tokenMasked: `hvz_live_••••••••${full.slice(-4)}`,
    createdAt: 'Just now',
    status: 'active',
  };
  API_TOKENS.push(token);
  return { token, fullValue: full };
}

export function revokeApiToken(id: string): void {
  const idx = API_TOKENS.findIndex((t) => t.id === id);
  if (idx !== -1) API_TOKENS[idx] = { ...API_TOKENS[idx], status: 'revoked' };
}
