import type { FlavorProfile } from '../services/drinkApi';

const SCALE = 10;

export function isFlavorProfile(value: unknown): value is FlavorProfile {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (['sweet', 'tart', 'light', 'rich'] as const).every((key) => {
    const score = row[key];
    return typeof score === 'number' && score >= 0 && score <= 100;
  });
}

/** Older recipes used 0–100. Show and plot everything on a 0–10 scale. */
export function scoreOutOfTen(score: number): number {
  const scaled = score > SCALE ? score / 10 : score;
  return Math.max(0, Math.min(SCALE, Math.round(scaled)));
}
