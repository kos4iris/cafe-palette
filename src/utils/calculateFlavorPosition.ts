import type { FlavorProfile } from '../services/drinkApi';
import { scoreOutOfTen } from './flavorProfile';

const SCALE = 10;

/** Place a saved drink on the flavor map. Axes run from -10 to 10. */
export function calculateFlavorPosition(profile: FlavorProfile): { x: number; y: number } {
  const sweet = scoreOutOfTen(profile.sweet);
  const tart = scoreOutOfTen(profile.tart);
  const light = scoreOutOfTen(profile.light);
  const rich = scoreOutOfTen(profile.rich);
  return {
    x: clampAxis(tart - sweet),
    y: clampAxis(rich - light),
  };
}

function clampAxis(value: number): number {
  return Math.max(-SCALE, Math.min(SCALE, value));
}
