export const DRINK_TYPES = [
  'refresher',
  'smoothie',
  'tea',
  'latte',
  'mocktail',
  'sparkling',
] as const;
export const TEMPERATURES = ['iced', 'hot'] as const;
export const SWEETNESS_LEVELS = ['low', 'medium', 'high'] as const;

export type DrinkType = (typeof DRINK_TYPES)[number];
export type Temperature = (typeof TEMPERATURES)[number];
export type Sweetness = (typeof SWEETNESS_LEVELS)[number];

/** Validated body of POST /api/generate-drink. */
export interface GenerateDrinkRequest {
  ingredients: string[];
  drinkType: DrinkType;
  temperature: Temperature;
  sweetness: Sweetness;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

/** Structured recipe returned to the frontend. */
export interface DrinkRecipe {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  garnish: string;
}
