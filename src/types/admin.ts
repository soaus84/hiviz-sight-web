/** A simple named/described record — the shape shared by every "just a tag"
 * admin list (Company divisions & regions, the three Taxonomy lists). These
 * are deliberately standalone from the live app: editing them here doesn't
 * touch the real REGIONS/DIVISIONS that drive purview filtering, or the real
 * SITES that drive the Insights workspace. See data/admin/. */
export interface TagRecord {
  id: string;
  name: string;
  description?: string;
}

export interface CompanyDetails {
  name: string;
  legalName: string;
  abn: string;
  address: string;
  timezone: string;
}

/** Standalone worksite record for the Admin CRUD screen — not the same
 * array as data/sites.ts's SITES, which drives the live Insights workspace
 * and must stay type-safe against RegionName/DivisionName. */
export interface AdminWorksite {
  id: string;
  name: string;
  region: string;
  division: string;
  type: string;
  supervisor: string;
  crewSize: number;
}

export type ApiTokenStatus = 'active' | 'revoked';

export interface ApiToken {
  id: string;
  name: string;
  /** Only the masked form is ever displayed after creation — see
   * createApiToken's one-time reveal value. */
  tokenMasked: string;
  createdAt: string;
  lastUsed?: string;
  status: ApiTokenStatus;
}
