/** A simple named/described record — the shape shared by every "just a tag"
 * admin list (Company divisions & regions, the three Taxonomy lists). These
 * are deliberately standalone from the live app: editing them here doesn't
 * touch the real REGIONS/DIVISIONS that drive purview filtering, or the real
 * SITES that drive the Insights workspace. See data/admin/. */
export interface TagRecord {
  id: string;
  name: string;
  description?: string;
  /** Id of this record's parent in another TagRecord list — e.g. a
   * Subdivision's parent Division. Only set for lists rendered with
   * TagList's `parent` prop. */
  parentId?: string;
}

/** An app-wide vocabulary term (e.g. "Division", "Subdivision") that Admin
 * can rename. The set of terms is fixed — this isn't a free-form tag list,
 * so there's no add/delete, only editing customLabel. Mock only for now:
 * nothing outside Admin reads customLabel yet, this just stores the
 * override for when that wiring happens. */
export interface TerminologyTerm {
  id: string;
  /** Stable key a future label lookup would key off — not shown in the UI. */
  key: string;
  defaultLabel: string;
  customLabel?: string;
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
