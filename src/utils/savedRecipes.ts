import type {
  DrinkRecipe,
  DrinkRecipeIngredient,
  DrinkRecipeSource,
  DrinkRecipeStep,
} from '../services/drinkApi';

const STORAGE_KEY = 'cafe-palette-saved-recipes';

/** A generated recipe plus the fields needed to show it again later. */
export interface SavedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: DrinkRecipeIngredient[];
  instructions: DrinkRecipeStep[];
  equipment?: string[];
  sources?: DrinkRecipeSource[];
  savedAt: string;
}

function fingerprint(recipe: {
  name: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  instructions: { instruction: string }[];
}): string {
  return [
    recipe.name.trim().toLowerCase(),
    recipe.description.trim().toLowerCase(),
    ...recipe.ingredients.map(
      (item) => `${item.name.trim().toLowerCase()}|${item.amount.trim().toLowerCase()}`,
    ),
    ...recipe.instructions.map((step) => step.instruction.trim().toLowerCase()),
  ].join('||');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSavedRecipe(value: unknown): value is SavedRecipe {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.ingredients) &&
    Array.isArray(value.instructions) &&
    typeof value.savedAt === 'string'
  );
}

export function getSavedRecipes(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedRecipe);
  } catch {
    return [];
  }
}

function writeSavedRecipes(recipes: SavedRecipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function isRecipeSaved(id: string): boolean {
  return getSavedRecipes().some((recipe) => recipe.id === id);
}

/** Id of an already-saved copy of this recipe, if the drink was saved before. */
export function findSavedRecipeId(recipe: DrinkRecipe): string | null {
  const key = fingerprint(recipe);
  return getSavedRecipes().find((item) => fingerprint(item) === key)?.id ?? null;
}

/**
 * Stores a generated recipe. Returns the existing record when the same drink
 * is already saved, so the palette never holds two copies.
 */
export function saveRecipe(recipe: DrinkRecipe): SavedRecipe {
  const existing = getSavedRecipes();
  const key = fingerprint(recipe);
  const match = existing.find((item) => fingerprint(item) === key);
  if (match) return match;

  const saved: SavedRecipe = {
    id: crypto.randomUUID(),
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients.map((item) => ({
      name: item.name,
      amount: item.amount,
      userSelected: item.userSelected,
    })),
    instructions: recipe.instructions.map((step) => ({
      step: step.step,
      instruction: step.instruction,
    })),
    equipment: [...recipe.equipment],
    sources: recipe.sources.map((source) => ({ ...source })),
    savedAt: new Date().toISOString(),
  };

  writeSavedRecipes([saved, ...existing]);
  return saved;
}

export function removeSavedRecipe(id: string) {
  writeSavedRecipes(getSavedRecipes().filter((recipe) => recipe.id !== id));
}
