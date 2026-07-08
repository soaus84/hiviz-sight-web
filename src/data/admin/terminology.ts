import type { TerminologyTerm } from '@/types';

// The set of terms is fixed — see TerminologyTerm's doc comment. Nothing
// outside Admin reads customLabel yet; this is mock-only until the rest of
// the app is wired to look terms up here instead of hardcoding them.
export const TERMINOLOGY_TERMS: TerminologyTerm[] = [
  { id: 'term1', key: 'division', defaultLabel: 'Division' },
  { id: 'term2', key: 'subdivision', defaultLabel: 'Subdivision' },
  { id: 'term3', key: 'region', defaultLabel: 'Region' },
  { id: 'term4', key: 'worksite', defaultLabel: 'Worksite' },
  { id: 'term5', key: 'highRiskWork', defaultLabel: 'High-risk work' },
  { id: 'term6', key: 'safetyPractice', defaultLabel: 'Safety Practice' },
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
