export type IngredientCategory =
  | 'fruit'
  | 'base'
  | 'sweetener'
  | 'herb'
  | 'other';

export type DrinkType =
  | 'refresher'
  | 'smoothie'
  | 'tea'
  | 'latte'
  | 'mocktail'
  | 'sparkling';

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  /** Hand-drawn artwork; falls back to the emoji when absent */
  art?: string;
  category: IngredientCategory;
  compatibleDrinkTypes: DrinkType[];
  flavorProfile: string[];
  /** Hex color used for glass blending */
  color: string;
  /** True for citrus fruits that use juice-style quantities */
  isCitrus?: boolean;
  /** Counts as a liquid/base for recipe unlock */
  isLiquid?: boolean;
  /** Counts as a flavor ingredient for recipe unlock */
  isFlavor?: boolean;
}

export interface RecipeLine {
  ingredientId: string;
  name: string;
  quantity: string;
}

export interface GeneratedRecipe {
  name: string;
  ingredients: RecipeLine[];
  instructions: string[];
  unusual: boolean;
  unusualMessage?: string;
}

export type Temperature = 'iced' | 'hot';
export type Sweetness = 'low' | 'medium' | 'high';
export type DietaryRestriction =
  | 'dairy-free'
  | 'vegan'
  | 'gluten-free'
  | 'sugar-free'
  | 'no-caffeine';

export const TEMPERATURES: { id: Temperature; label: string }[] = [
  { id: 'iced', label: 'Iced' },
  { id: 'hot', label: 'Hot' },
];

export const SWEETNESS_LEVELS: { id: Sweetness; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export const DIETARY_RESTRICTIONS: { id: DietaryRestriction; label: string }[] = [
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'sugar-free', label: 'Sugar-free' },
  { id: 'no-caffeine', label: 'No caffeine' },
];

export const DRINK_TYPES: { id: DrinkType; label: string; emoji: string }[] = [
  { id: 'refresher', label: 'Refresher', emoji: '🧊' },
  { id: 'smoothie', label: 'Smoothie', emoji: '🥤' },
  { id: 'tea', label: 'Tea', emoji: '🍵' },
  { id: 'latte', label: 'Latte', emoji: '☕' },
  { id: 'mocktail', label: 'Mocktail', emoji: '🍸' },
  { id: 'sparkling', label: 'Sparkling', emoji: '✨' },
];
