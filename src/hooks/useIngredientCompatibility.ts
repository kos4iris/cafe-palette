import { useEffect, useMemo, useState } from 'react';
import { checkCompatibility } from '../services/compatibilityApi';
import type { Ingredient } from '../types';
import {
  checkIngredientCompatibility,
  type CompatibilityResult,
} from '../utils/checkIngredientCompatibility';

const DEBOUNCE_MS = 700;
const cache = new Map<string, CompatibilityResult>();

export function useIngredientCompatibility(ingredients: Ingredient[]): CompatibilityResult | null {
  const local = useMemo(() => checkIngredientCompatibility(ingredients), [ingredients]);
  const key = ingredients
    .map((item) => item.id)
    .sort()
    .join('|');
  const [remote, setRemote] = useState<{ key: string; result: CompatibilityResult } | null>(null);

  useEffect(() => {
    if (ingredients.length < 3 || local) return;
    const cached = cache.get(key);
    if (cached) {
      setRemote({ key, result: cached });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const names = ingredients.map((item) => item.name.toLowerCase());
      checkCompatibility(names, controller.signal)
        .then((result) => {
          cache.set(key, result);
          setRemote({ key, result });
        })
        .catch(() => {
          // A failed or cancelled check stays quiet. Local rules still show.
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ingredients, key, local]);

  if (local) return local;
  if (remote?.key === key) return remote.result;
  return null;
}
