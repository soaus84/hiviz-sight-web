import { colors } from '@/tokens';
import type { AtrophyState } from '@/types/site';

export function deriveAtrophyState(score: number | null): AtrophyState {
  if (score === null) return null;
  if (score >= 70) return 'critical';
  if (score >= 40) return 'elevated';
  return 'active';
}

export function atrophyTone(score: number | null): string {
  if (score === null) return colors.inkMuted;
  if (score >= 55) return colors.red;
  if (score >= 38) return colors.amber;
  return colors.green;
}
