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
export const DIETARY_RESTRICTIONS = [
  'dairy-free',
  'vegan',
  'gluten-free',
  'sugar-free',
  'no-caffeine',
] as const;

export type DrinkType = (typeof DRINK_TYPES)[number];
export type Temperature = (typeof TEMPERATURES)[number];
export type Sweetness = (typeof SWEETNESS_LEVELS)[number];
export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

export type CompatibilityStatus = 'good' | 'unusual' | 'problematic';

export interface CompatibilityNote {
  status: CompatibilityStatus;
  reason?: string;
  suggestion?: string;
}

/** Validated body of POST /api/generate-drink. */
export interface GenerateDrinkRequest {
  ingredients: string[];
  drinkType: DrinkType;
  temperature: Temperature;
  sweetness: Sweetness;
  /** How many drinks to write the recipe for. */
  servings: number;
  /** Hard constraints for both selected and added ingredients. Empty means none. */
  dietaryRestrictions: DietaryRestriction[];
  compatibility?: CompatibilityNote;
  /** The last few drinks made from this same ingredient selection. */
  recentRecipes?: RecentRecipe[];
}

export interface RecentRecipe {
  name: string;
  drinkCategory: DrinkRecipe['drinkCategory'];
  mainIngredients: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  /** False when Gemini added it to balance the drink. */
  userSelected: boolean;
}

export interface RecipeStep {
  step: number;
  instruction: string;
}

/** A web page the grounded research step actually cited. */
export interface RecipeSource {
  title: string;
  url: string;
}

/** Structured recipe returned to the frontend. */
export interface DrinkRecipe {
  name: string;
  /** established when the name matches a known style, descriptive for flavor plus style, creative when neither fits. */
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
  ingredients: RecipeIngredient[];
  equipment: string[];
  instructions: RecipeStep[];
  /** Active time, such as "8 min". */
  prepTime: string;
  servings: number;
  /** 1 is easiest, 5 is the most involved. */
  difficulty: number;
  /** Matches difficulty: Very easy, Easy, Moderate, Advanced, or Very advanced. */
  difficultyLabel: string;
  sources: RecipeSource[];
  /** Echo of the restrictions the recipe was written for. */
  dietaryRestrictions: DietaryRestriction[];
  dietaryConflict: {
    hasConflict: boolean;
    message: string | null;
    suggestion: string | null;
  };
  /** A finishing layer, or null when this drink should not have one. */
  topper: {
    name: string;
    description: string;
  } | null;
  /** Debug note for why a topper was included or left off. */
  topperDecision: {
    considered: boolean;
    reason: string;
  };
  /** Finished-drink scores from 0 to 10. Opposing axes are independent. */
  flavorProfile: {
    sweet: number;
    tart: number;
    light: number;
    rich: number;
  } | null;
}
