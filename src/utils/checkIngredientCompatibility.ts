import type { Ingredient } from '../types';

export type CompatibilityStatus = 'good' | 'unusual' | 'problematic';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  reason?: string;
  suggestion?: string;
}

const DAIRY = ['milk'] as const;
const CREAMY = ['milk', 'oat-milk'] as const;
const ACIDIC_SODA = ['coca-cola', 'sprite', 'energy-drink'] as const;
const CURDLING_CITRUS = ['lemon', 'lime', 'pineapple'] as const;
const STRONG = ['coffee', 'matcha', 'energy-drink', 'black-tea'] as const;

/**
 * Obvious pairings only. Returns null when nothing local applies, so the
 * caller can ask Gemini for a less clear mix.
 */
export function checkIngredientCompatibility(
  ingredients: Ingredient[],
): CompatibilityResult | null {
  if (ingredients.length < 2) return null;

  const ids = new Set(ingredients.map((item) => item.id));
  const nameOf = (id: string) => ingredients.find((item) => item.id === id)?.name ?? id;

  const dairy = DAIRY.filter((id) => ids.has(id));
  const soda = ACIDIC_SODA.filter((id) => ids.has(id));
  const citrus = CURDLING_CITRUS.filter((id) => ids.has(id));

  if (dairy.length > 0 && soda.length > 0) {
    const milk = nameOf(dairy[0]);
    const acid = nameOf(soda[0]);
    return {
      status: 'problematic',
      reason: `${milk} + ${acid} may separate because ${acid} is acidic.`,
      suggestion:
        soda[0] === 'coca-cola'
          ? 'Try oat milk, cream soda, or sparkling water instead.'
          : 'Try oat milk, or sparkling water instead.',
    };
  }

  if (dairy.length > 0 && citrus.length > 0) {
    return {
      status: 'problematic',
      reason: `${nameOf(dairy[0])} + ${nameOf(citrus[0])} may separate because citrus is acidic.`,
      suggestion: 'Try oat milk, which is less likely to curdle.',
    };
  }

  const strong = STRONG.filter((id) => ids.has(id));
  if (strong.length >= 3) {
    return {
      status: 'unusual',
      reason: 'This has several strong flavors, so it may taste muddy. It could still work if one of them leads.',
      suggestion: 'Try keeping one bold ingredient and building around it.',
    };
  }

  if (ids.has('coffee') && ids.has('matcha')) {
    return {
      status: 'unusual',
      reason: 'This combination is a little adventurous, but it could still work.',
      suggestion: 'Let one of them lead, and keep the other as a small accent.',
    };
  }

  if (ids.has('milk') && ids.has('oat-milk')) {
    return {
      status: 'unusual',
      reason: 'Milk and oat milk together may make the drink overly rich.',
      suggestion: 'Try using just one creamy base.',
    };
  }

  if ((ids.has('milk') || ids.has('oat-milk')) && ids.has('sparkling-water')) {
    return {
      status: 'unusual',
      reason: 'This combination is a little adventurous, but it could still work.',
    };
  }

  if (ids.has('coffee') && (ids.has('lemon') || ids.has('lime'))) {
    return {
      status: 'unusual',
      reason: 'This combination is a little adventurous, but it could still work.',
      suggestion: 'A small squeeze of citrus usually works better than a full citrus base.',
    };
  }

  const good = goodPairing(ids, nameOf);
  return good ? { status: 'good', reason: good } : null;
}

function goodPairing(
  ids: Set<string>,
  nameOf: (id: string) => string,
): string | null {
  const creamy = CREAMY.find((id) => ids.has(id));
  const tea = (['green-tea', 'black-tea'] as const).find((id) => ids.has(id));

  if (ids.has('strawberry') && ids.has('matcha') && creamy) {
    return works('strawberry', 'matcha', creamy);
  }
  if (ids.has('strawberry') && creamy) return works('strawberry', creamy);
  if (ids.has('mango') && creamy) return works('mango', creamy);
  if (ids.has('coffee') && creamy) return works('coffee', creamy);
  if (ids.has('matcha') && creamy) return works('matcha', creamy);
  if (ids.has('orange') && ids.has('milk')) return works('orange', 'milk');
  if ((ids.has('lemon') || ids.has('orange')) && tea) {
    return works(ids.has('lemon') ? 'lemon' : 'orange', tea);
  }
  if (ids.has('cherry') && ids.has('coca-cola')) return works('cherry', 'coca-cola');
  if ((ids.has('lemon') || ids.has('orange') || ids.has('mango') || ids.has('strawberry')) && ids.has('sparkling-water')) {
    const fruit = (['lemon', 'orange', 'mango', 'strawberry'] as const).find((id) => ids.has(id));
    if (fruit) return works(fruit, 'sparkling-water');
  }

  function works(...keys: string[]): string {
    return `${keys.map(nameOf).join(' + ')} work well together.`;
  }

  return null;
}
