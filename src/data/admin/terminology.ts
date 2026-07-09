import type { TerminologyTerm } from '@/types';

// The set of terms is fixed — see TerminologyTerm's doc comment. Nothing
// outside Admin reads customLabel yet; this is mock-only until the rest of
// the app is wired to look terms up here instead of hardcoding them.
export const TERMINOLOGY_TERMS: TerminologyTerm[] = [
  // Structure — mirrors the Structure nav item plus the standalone Worksite
  // entity (Worksites nav), since a worksite is the base unit that
  // divisions/subdivisions/regions organise.
  { id: 'term1', key: 'division', defaultLabel: 'Division', group: 'structure' },
  { id: 'term2', key: 'subdivision', defaultLabel: 'Subdivision', group: 'structure' },
  { id: 'term3', key: 'region', defaultLabel: 'Region', group: 'structure' },
  { id: 'term4', key: 'worksite', defaultLabel: 'Worksite', group: 'structure' },
  // Roles — the fixed set of user roles (see AdminUsers/MemberDetail's ROLES).
  { id: 'term5', key: 'safetyManagerRole', defaultLabel: 'Safety Manager', group: 'roles' },
  { id: 'term6', key: 'businessManagerRole', defaultLabel: 'Business Manager', group: 'roles' },
  // Taxonomies — mirrors the three Taxonomies nav tabs.
  { id: 'term7', key: 'worksiteType', defaultLabel: 'Worksite type', group: 'taxonomies' },
  { id: 'term8', key: 'highRiskWork', defaultLabel: 'High-risk work', group: 'taxonomies' },
  { id: 'term9', key: 'safetyPractice', defaultLabel: 'Safety Practice', group: 'taxonomies' },
];

export function updateTerminologyLabel(id: string, customLabel: string): TerminologyTerm | null {
  const idx = TERMINOLOGY_TERMS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  TERMINOLOGY_TERMS[idx] = { ...TERMINOLOGY_TERMS[idx], customLabel: customLabel.trim() || undefined };
  return TERMINOLOGY_TERMS[idx];
}

/** Clears a term back to its default — a dedicated action rather than
 * making people blank the field by hand and hit Save. */
export function clearTerminologyLabel(id: string): TerminologyTerm | null {
  return updateTerminologyLabel(id, '');
}
