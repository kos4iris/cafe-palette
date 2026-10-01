import type { DrinkType, GeneratedRecipe, Ingredient, RecipeLine } from '../types';

function hasId(list: Ingredient[], id: string): boolean {
  return list.some((i) => i.id === id);
}

function quantityFor(
  ingredient: Ingredient,
  drinkType: DrinkType,
  fruitCount: number,
): string {
  const { category, isCitrus, id } = ingredient;

  if (category === 'herb') {
    if (drinkType === 'mocktail' || drinkType === 'sparkling') return '4 leaves';
    if (drinkType === 'tea') return '3–5 leaves';
    return '6 leaves';
  }

  if (category === 'sweetener') {
    if (id === 'honey' || id === 'maple-syrup') return '1 tbsp';
    return '1–2 tsp';
  }

  if (category === 'other') {
    if (id === 'matcha') return drinkType === 'latte' ? '1 tsp' : '1/2 tsp';
    if (id === 'coffee') {
      return drinkType === 'latte' ? '2 oz espresso' : '1/2 cup cold brew';
    }
  }

  if (ingredient.isLiquid || category === 'base') {
    switch (drinkType) {
      case 'smoothie':
        return '1 cup';
      case 'latte':
        return id.includes('milk') ? '1 cup steamed' : '6 oz';
      case 'tea':
        return '8 oz';
      case 'refresher':
        return '6–8 oz';
      case 'mocktail':
        return id === 'sparkling-water' ? '4–6 oz' : '4 oz';
      case 'sparkling':
        return '6 oz';
      default:
        return '6 oz';
    }
  }

  if (isCitrus) {
    if (drinkType === 'mocktail') return '1–2 tbsp juice';
    if (drinkType === 'refresher' || drinkType === 'sparkling') return '1 tbsp juice';
    if (drinkType === 'tea') return '1 tsp juice or a slice';
    return '1 tbsp juice';
  }

  // Fruit
  switch (drinkType) {
    case 'smoothie':
      return fruitCount >= 3 ? '1/2 cup' : '1 cup';
    case 'refresher':
      return '1/4–1/2 cup';
    case 'mocktail':
      return '1/4 cup';
    case 'sparkling':
      return '1/4 cup muddled';
    case 'tea':
      return '3–4 slices or 1/4 cup';
    case 'latte':
      return '2 tbsp puree';
    default:
      return '1/4 cup';
  }
}

const STYLE_SUFFIX: Record<DrinkType, string[]> = {
  refresher: ['Refresher', 'Cooler', 'Splash'],
  smoothie: ['Smoothie', 'Blend', 'Shake'],
  tea: ['Tea', 'Infusion', 'Brew'],
  latte: ['Latte', 'Cloud', 'Cream'],
  mocktail: ['Mocktail', 'Spritz', 'Highball'],
  sparkling: ['Fizz', 'Bubbly', 'Sparkler'],
};

function pickName(ingredients: Ingredient[], drinkType: DrinkType): string {
  const fruits = ingredients.filter((i) => i.category === 'fruit');
  const herbs = ingredients.filter((i) => i.category === 'herb');
  const others = ingredients.filter(
    (i) => i.category === 'other' || i.id.includes('tea') || i.id === 'matcha' || i.id === 'coffee',
  );

  const headline: string[] = [];
  if (fruits[0]) headline.push(fruits[0].name);
  if (herbs[0] && headline[0] !== herbs[0].name) headline.push(herbs[0].name);
  if (headline.length < 2 && fruits[1]) headline.push(fruits[1].name);
  if (headline.length === 0 && others[0]) headline.push(others[0].name);
  if (headline.length === 0) headline.push('Garden');

  const suffixes = STYLE_SUFFIX[drinkType];
  let suffix = suffixes[0];

  if (hasId(ingredients, 'sparkling-water') || drinkType === 'sparkling') {
    suffix = 'Fizz';
  } else if (drinkType === 'mocktail' && herbs.length) {
    suffix = 'Spritz';
  } else if (drinkType === 'smoothie') {
    suffix = 'Smoothie';
  } else if (drinkType === 'latte') {
    suffix = hasId(ingredients, 'matcha') ? 'Latte' : 'Latte';
  } else {
    const hash = ingredients.reduce((n, i) => n + i.id.charCodeAt(0), 0);
    suffix = suffixes[hash % suffixes.length];
  }

  return `${headline.join(' ')} ${suffix}`;
}

function detectUnusual(
  ingredients: Ingredient[],
  drinkType: DrinkType,
): { unusual: boolean; message?: string } {
  const ids = new Set(ingredients.map((i) => i.id));
  const reasons: string[] = [];

  if (ids.has('coffee') && ids.has('matcha')) {
    reasons.push('coffee and matcha together');
  }
  if (
    (ids.has('milk') || ids.has('oat-milk')) &&
    ids.has('sparkling-water')
  ) {
    reasons.push('creamy milk with bubbles');
  }
  if (ids.has('coffee') && (ids.has('lemon') || ids.has('lime'))) {
    reasons.push('coffee with sharp citrus');
  }
  if (ids.has('basil') && ids.has('coffee')) {
    reasons.push('basil with coffee');
  }
  if (
    drinkType === 'latte' &&
    ingredients.some((i) => i.category === 'fruit' && !i.isCitrus) &&
    !ids.has('matcha') &&
    !ids.has('coffee') &&
    !ids.has('black-tea')
  ) {
    reasons.push('fruit-forward lattes can taste surprising');
  }
  if (
    (ids.has('milk') || ids.has('oat-milk')) &&
    (ids.has('lemon') || ids.has('lime')) &&
    drinkType !== 'smoothie'
  ) {
    reasons.push('citrus can curdle dairy');
  }

  const incompatible = ingredients.filter(
    (i) => !i.compatibleDrinkTypes.includes(drinkType),
  );
  if (incompatible.length > 0) {
    reasons.push(
      `${incompatible.map((i) => i.name.toLowerCase()).join(', ')} with a ${drinkType}`,
    );
  }

  if (reasons.length === 0) return { unusual: false };

  return {
    unusual: true,
    message: `These ingredients might create an unusual combination — ${reasons[0]}.`,
  };
}

function buildInstructions(
  ingredients: Ingredient[],
  drinkType: DrinkType,
): string[] {
  const hasFruit = ingredients.some((i) => i.category === 'fruit');
  const hasHerb = ingredients.some((i) => i.category === 'herb');
  const hasCitrus = ingredients.some((i) => i.isCitrus);
  const hasSweet = ingredients.some((i) => i.category === 'sweetener');
  const liquids = ingredients.filter((i) => i.isLiquid || i.category === 'base');
  const liquidNames = liquids.map((i) => i.name.toLowerCase()).join(' and ');

  const steps: string[] = [];

  switch (drinkType) {
    case 'smoothie':
      if (hasFruit) steps.push('Add fruit to a blender.');
      if (hasHerb) steps.push('Toss in the herbs.');
      if (hasSweet) steps.push('Add sweetener.');
      steps.push(`Pour in ${liquidNames || 'your liquid base'} and 1/2 cup ice.`);
      steps.push('Blend until smooth and creamy. Pour into a chilled glass.');
      break;

    case 'latte':
      if (ingredients.some((i) => i.id === 'matcha')) {
        steps.push('Whisk matcha with a splash of hot water until smooth.');
      } else if (ingredients.some((i) => i.id === 'coffee')) {
        steps.push('Brew a strong espresso or coffee shot.');
      } else if (ingredients.some((i) => i.id.includes('tea'))) {
        steps.push('Steep tea until fragrant and bold.');
      } else {
        steps.push('Prepare your flavor base.');
      }
      if (hasFruit) steps.push('Stir in fruit puree.');
      if (hasSweet) steps.push('Sweeten to taste.');
      steps.push(`Steam or froth ${liquidNames || 'milk'}, then pour over the base.`);
      steps.push('Gently swirl and serve warm.');
      break;

    case 'tea':
      steps.push('Steep your tea in hot water for 3–5 minutes.');
      if (hasFruit || hasHerb) {
        steps.push(
          `Add ${[
            hasFruit ? 'fruit' : null,
            hasHerb ? 'herbs' : null,
          ]
            .filter(Boolean)
            .join(' and ')} while warm so the flavors bloom.`,
        );
      }
      if (hasCitrus) steps.push('Finish with a squeeze of citrus.');
      if (hasSweet) steps.push('Sweeten while still warm, then stir.');
      steps.push('Strain if desired and sip slowly.');
      break;

    case 'mocktail':
      if (hasFruit && hasHerb) {
        steps.push('Muddle the fruit and herbs in a shaker or glass.');
      } else if (hasFruit) {
        steps.push('Muddle the fruit gently to release juice.');
      } else if (hasHerb) {
        steps.push('Clap the herbs to wake up the aroma, then muddle lightly.');
      }
      if (hasCitrus) steps.push('Add citrus juice and ice.');
      else steps.push('Add ice.');
      if (hasSweet) steps.push('Drizzle in sweetener and stir.');
      steps.push(`Top with ${liquidNames || 'sparkling water'}.`);
      steps.push('Stir once and garnish with leftover herbs or fruit.');
      break;

    case 'sparkling':
      if (hasFruit) steps.push('Muddle fruit in the bottom of a tall glass.');
      if (hasHerb) steps.push('Add herbs and press lightly.');
      if (hasCitrus) steps.push('Squeeze in citrus juice.');
      if (hasSweet) steps.push('Stir in sweetener until dissolved.');
      steps.push('Fill with ice.');
      steps.push(`Pour ${liquidNames || 'sparkling water'} over the mixture.`);
      steps.push('Give a gentle stir so the bubbles stay lively.');
      break;

    case 'refresher':
    default:
      if (hasFruit && hasHerb) {
        steps.push('Muddle the fruit and herbs together.');
      } else if (hasFruit) {
        steps.push('Muddle or muddle-slice the fruit.');
      }
      if (hasCitrus) steps.push('Add citrus juice and ice.');
      else steps.push('Add ice.');
      if (hasSweet) steps.push('Stir in sweetener.');
      steps.push(`Pour ${liquidNames || 'your base'} over the mixture.`);
      steps.push('Stir and garnish with mint or a fruit slice.');
      break;
  }

  return steps;
}

/** Style used when the menu no longer asks the user to pick one. */
export function inferDrinkType(ingredients: Ingredient[]): DrinkType {
  const ids = new Set(ingredients.map((item) => item.id));
  const has = (...keys: string[]) => keys.some((key) => ids.has(key));
  const hasMilk = has('milk', 'oat-milk');
  const hasTea = has('green-tea', 'black-tea', 'matcha');

  if (has('coffee') || (hasMilk && has('matcha'))) return 'latte';
  if (hasTea) return 'tea';
  if (has('sparkling-water', 'coca-cola', 'energy-drink')) return 'sparkling';
  if (hasMilk && ingredients.some((item) => item.category === 'fruit')) return 'smoothie';
  return 'refresher';
}

export function canGenerateRecipe(ingredients: Ingredient[]): boolean {
  const hasFlavor = ingredients.some((i) => i.isFlavor && !i.isLiquid);
  const hasLiquid = ingredients.some((i) => i.isLiquid);
  // Coffee/tea count as both; allow if we have liquid + any flavor OR liquid that is also flavored + another item
  const flavoredLiquid = ingredients.filter((i) => i.isLiquid && i.isFlavor);
  if (hasLiquid && hasFlavor) return true;
  if (flavoredLiquid.length >= 1 && ingredients.length >= 2) return true;
  return false;
}

export function generateRecipe(
  ingredients: Ingredient[],
  drinkType: DrinkType,
): GeneratedRecipe | null {
  if (!canGenerateRecipe(ingredients)) return null;

  const fruitCount = ingredients.filter((i) => i.category === 'fruit').length;
  const lines: RecipeLine[] = ingredients.map((ing) => ({
    ingredientId: ing.id,
    name: ing.name,
    quantity: quantityFor(ing, drinkType, fruitCount),
  }));

  // Always suggest ice except for hot latte/tea without sparkling
  const wantsIce =
    drinkType === 'smoothie' ||
    drinkType === 'refresher' ||
    drinkType === 'mocktail' ||
    drinkType === 'sparkling' ||
    (drinkType === 'tea' && hasId(ingredients, 'sparkling-water'));

  if (wantsIce) {
    lines.push({
      ingredientId: 'ice',
      name: 'Ice',
      quantity: drinkType === 'smoothie' ? '1/2 cup' : 'as needed',
    });
  }

  const unusual = detectUnusual(ingredients, drinkType);

  return {
    name: pickName(ingredients, drinkType),
    ingredients: lines,
    instructions: buildInstructions(ingredients, drinkType),
    unusual: unusual.unusual,
    unusualMessage: unusual.message,
  };
}

/** Blend ingredient colors into a drink fill (weighted toward stronger flavors). */
export function blendDrinkColors(ingredients: Ingredient[]): {
  layers: string[];
  blended: string;
} {
  if (ingredients.length === 0) {
    return { layers: [], blended: 'transparent' };
  }

  const layers = ingredients.map((i) => i.color);
  const rgb = ingredients.reduce(
    (acc, ing) => {
      const weight =
        ing.category === 'fruit' || ing.category === 'other' ? 2 : 1;
      const c = hexToRgb(ing.color);
      return {
        r: acc.r + c.r * weight,
        g: acc.g + c.g * weight,
        b: acc.b + c.b * weight,
        w: acc.w + weight,
      };
    },
    { r: 0, g: 0, b: 0, w: 0 },
  );

  const blended = rgbToHex(
    Math.round(rgb.r / rgb.w),
    Math.round(rgb.g / rgb.w),
    Math.round(rgb.b / rgb.w),
  );

  return { layers, blended };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}
