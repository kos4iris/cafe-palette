import type { DrinkType, Sweetness, Temperature } from '../types';

export interface DrinkRecipeIngredient {
  name: string;
  amount: string;
}

/** Recipe returned by POST /api/generate-drink. */
export interface DrinkRecipe {
  name: string;
  description: string;
  ingredients: DrinkRecipeIngredient[];
  instructions: string[];
  garnish: string;
}

export interface GenerateDrinkInput {
  ingredients: string[];
  drinkType: DrinkType;
  temperature: Temperature;
  sweetness: Sweetness;
}

const GENERIC_ERROR = "We couldn't mix that drink right now. Please try again.";
const REQUEST_TIMEOUT_MS = 45_000;

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
    typeof r.garnish === 'string' &&
    Array.isArray(r.instructions) &&
    r.instructions.every((s) => typeof s === 'string') &&
    Array.isArray(r.ingredients) &&
    r.ingredients.every(
      (i) => typeof i?.name === 'string' && typeof i?.amount === 'string',
    )
  );
}
