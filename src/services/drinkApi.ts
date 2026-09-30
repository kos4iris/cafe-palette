import type { DrinkType, Sweetness, Temperature } from '../types';
import type { CompatibilityResult } from '../utils/checkIngredientCompatibility';

export interface DrinkRecipeIngredient {
  name: string;
  amount: string;
  /** False when Gemini added it to balance the drink. */
  userSelected: boolean;
}

export interface DrinkRecipeStep {
  step: number;
  instruction: string;
}

export interface DrinkRecipeSource {
  title: string;
  url: string;
}

/** Recipe returned by POST /api/generate-drink. */
export interface DrinkRecipe {
  name: string;
  nameType: 'established' | 'descriptive' | 'creative';
  drinkCategory:
    | 'lemonade'
    | 'latte'
    | 'iced tea'
    | 'smoothie'
    | 'milk tea'
    | 'tonic'
    | 'soda'
    | 'lassi'
    | 'other';
  description: string;
  ingredients: DrinkRecipeIngredient[];
  equipment: string[];
  instructions: DrinkRecipeStep[];
  prepTime: string;
  servings: number;
  /** 1 is easiest, 5 is the most involved. */
  difficulty: number;
  difficultyLabel: string;
  sources: DrinkRecipeSource[];
}

export interface GenerateDrinkInput {
  ingredients: string[];
  drinkType: DrinkType;
  temperature: Temperature;
  sweetness: Sweetness;
  servings: number;
  compatibility?: CompatibilityResult;
}

const GENERIC_ERROR = "We couldn't mix that drink right now. Please try again.";
// Generous: the backend may make a grounded research call before composing.
const REQUEST_TIMEOUT_MS = 70_000;

/** Thrown with a message that is safe to show to the user. */
export class DrinkApiError extends Error {}

export async function generateDrink(
  input: GenerateDrinkInput,
): Promise<DrinkRecipe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/generate-drink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new DrinkApiError(readErrorMessage(data) ?? GENERIC_ERROR);
    }
    if (!isDrinkRecipe(data)) {
      throw new DrinkApiError(GENERIC_ERROR);
    }
    return data;
  } catch (err) {
    if (err instanceof DrinkApiError) throw err;
    // Network failure, backend not running, or timeout.
    throw new DrinkApiError(
      "We couldn't reach the drink kitchen. Please try again in a moment.",
    );
  } finally {
    clearTimeout(timer);
  }
}

function readErrorMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const { error } = data as { error: unknown };
    if (typeof error === 'string' && error.trim()) return error;
  }
  return null;
}

function isDrinkRecipe(data: unknown): data is DrinkRecipe {
  if (typeof data !== 'object' || data === null) return false;
  const r = data as Partial<DrinkRecipe>;
  return (
    typeof r.name === 'string' &&
    typeof r.description === 'string' &&
    (r.nameType === 'established' || r.nameType === 'descriptive' || r.nameType === 'creative') &&
    (r.drinkCategory === 'lemonade' ||
      r.drinkCategory === 'latte' ||
      r.drinkCategory === 'iced tea' ||
      r.drinkCategory === 'smoothie' ||
      r.drinkCategory === 'milk tea' ||
      r.drinkCategory === 'tonic' ||
      r.drinkCategory === 'soda' ||
      r.drinkCategory === 'lassi' ||
      r.drinkCategory === 'other') &&
    Array.isArray(r.equipment) &&
    r.equipment.every((e) => typeof e === 'string') &&
    Array.isArray(r.instructions) &&
    r.instructions.every(
      (s) => typeof s?.step === 'number' && typeof s?.instruction === 'string',
    ) &&
    Array.isArray(r.ingredients) &&
    r.ingredients.every(
      (i) => typeof i?.name === 'string' && typeof i?.amount === 'string',
    ) &&
    Array.isArray(r.sources) &&
    r.sources.every(
      (s) => typeof s?.title === 'string' && typeof s?.url === 'string',
    ) &&
    typeof r.prepTime === 'string' &&
    typeof r.servings === 'number' &&
    typeof r.difficulty === 'number' &&
    typeof r.difficultyLabel === 'string'
  );
}
