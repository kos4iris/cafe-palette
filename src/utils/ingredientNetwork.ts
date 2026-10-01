import { INGREDIENTS } from '../data/ingredients';
import type { SavedRecipe } from './savedRecipes';

export type IngredientNetworkNode = {
  id: string;
  type: 'drink' | 'ingredient';
  label: string;
  recipeId?: string;
  drinks: { id: string; name: string }[];
};

export type IngredientNetworkEdge = {
  id: string;
  source: string;
  target: string;
};

export type IngredientNetworkData = {
  nodes: IngredientNetworkNode[];
  edges: IngredientNetworkEdge[];
};

const CATALOG = new Map(INGREDIENTS.map((item) => [item.name.toLowerCase(), item.name]));

/**
 * Case, spacing, hyphens, and a leading "fresh" collapse so obvious duplicates
 * share one node. Unrelated names are left alone.
 */
export function ingredientKey(name: string): string {
  const base = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const stripped = base
    .replace(/^freshly squeezed\s+/, '')
    .replace(/^freshly\s+/, '')
    .replace(/^fresh\s+/, '');
  const spaced = stripped.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  if (CATALOG.has(stripped)) return stripped;
  if (CATALOG.has(spaced)) return spaced;
  if (CATALOG.has(base)) return base;
  return spaced || base;
}

function labelFor(key: string): string {
  return CATALOG.get(key) ?? key.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function buildIngredientNetwork(recipes: SavedRecipe[]): IngredientNetworkData {
  const nodes: IngredientNetworkNode[] = [];
  const edges: IngredientNetworkEdge[] = [];
  const ingredients = new Map<string, IngredientNetworkNode>();
  const ordered = [...recipes].sort((a, b) => a.savedAt.localeCompare(b.savedAt));

  for (const recipe of ordered) {
    const drinkId = `drink:${recipe.id}`;
    nodes.push({
      id: drinkId,
      type: 'drink',
      label: recipe.name,
      recipeId: recipe.id,
      drinks: [{ id: recipe.id, name: recipe.name }],
    });

    const seen = new Set<string>();
    for (const item of recipe.ingredients) {
      const raw = item.name.trim();
      if (!raw) continue;
      const key = ingredientKey(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);

      const nodeId = `ingredient:${key}`;
      let ingredient = ingredients.get(key);
      if (!ingredient) {
        ingredient = {
          id: nodeId,
          type: 'ingredient',
          label: labelFor(key),
          drinks: [],
        };
        ingredients.set(key, ingredient);
        nodes.push(ingredient);
      }
      ingredient.drinks.push({ id: recipe.id, name: recipe.name });
      edges.push({ id: `${drinkId}--${nodeId}`, source: drinkId, target: nodeId });
    }
  }

  return { nodes, edges };
}
