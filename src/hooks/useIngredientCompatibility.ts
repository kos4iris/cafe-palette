import { useEffect, useMemo, useState } from 'react';
import { checkCompatibility } from '../services/compatibilityApi';
import type { Ingredient } from '../types';
import {
  checkIngredientCompatibility,
  type CompatibilityResult,
} from '../utils/checkIngredientCompatibility';

const DEBOUNCE_MS = 700;
const cache = new Map<string, CompatibilityResult>();

/** What the menu should show for the ingredients currently in the cup. */
export type CompatibilityFeedback =
  | { kind: 'empty' }
  | { kind: 'result'; result: CompatibilityResult };

export function useIngredientCompatibility(ingredients: Ingredient[]): CompatibilityFeedback {
  const local = useMemo(() => checkIngredientCompatibility(ingredients), [ingredients]);
  const key = ingredients
    .map((item) => item.id)
    .sort()
    .join('|');
  const [remote, setRemote] = useState<{ key: string; result: CompatibilityResult } | null>(null);

  useEffect(() => {
    // Obvious pairs are decided locally. Gemini is only for an unclear mix of 2+.
    if (ingredients.length < 2 || local) return;

    const cached = cache.get(key);
    if (cached) {
      setRemote({ key, result: cached });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const names = ingredients.map((item) => item.name.toLowerCase());
      checkCompatibility(names, controller.signal)
        .then((result) => {
          // Ignore a response that belongs to an older selection.
          if (cancelled) return;
          cache.set(key, result);
          setRemote({ key, result });
        })
        .catch(() => {
          // A failed or cancelled check stays quiet. Local rules still show.
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [ingredients, key, local]);

  if (ingredients.length < 2) return { kind: 'empty' };
  if (local) return { kind: 'result', result: local };
  if (remote?.key === key) return { kind: 'result', result: remote.result };
  return { kind: 'empty' };
}
