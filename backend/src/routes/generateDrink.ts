import { Router } from 'express';
import {
  GeminiConfigError,
  generateDrinkRecipe,
} from '../services/gemini.js';
import {
  DRINK_TYPES,
  SWEETNESS_LEVELS,
  TEMPERATURES,
  type GenerateDrinkRequest,
} from '../types/DrinkRecipe.js';

const MAX_INGREDIENTS = 12;
// Letters, digits, spaces and a few name-friendly symbols; keeps prompts tidy.
const INGREDIENT_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '’&-]{0,39}$/u;

type ParseResult =
  | { ok: true; value: GenerateDrinkRequest }
  | { ok: false; error: string };

function parseRequest(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Send a JSON body with an ingredients list.' };
  }
  const input = body as Record<string, unknown>;

  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    return { ok: false, error: 'Pick at least one ingredient first.' };
  }
  if (input.ingredients.length > MAX_INGREDIENTS) {
    return {
      ok: false,
      error: `Please use no more than ${MAX_INGREDIENTS} ingredients.`,
    };
  }

  const seen = new Set<string>();
  const ingredients: string[] = [];
  for (const item of input.ingredients) {
    const name = typeof item === 'string' ? item.trim() : '';
    if (!INGREDIENT_PATTERN.test(name)) {
      return {
        ok: false,
        error: 'Ingredient names must be short and use plain text only.',
      };
    }
    if (!seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      ingredients.push(name);
    }
  }

  const drinkType = input.drinkType ?? 'refresher';
  const temperature = input.temperature ?? 'iced';
  const sweetness = input.sweetness ?? 'medium';

  if (!isOneOf(DRINK_TYPES, drinkType)) {
    return { ok: false, error: `drinkType must be one of: ${DRINK_TYPES.join(', ')}.` };
  }
  if (!isOneOf(TEMPERATURES, temperature)) {
    return { ok: false, error: `temperature must be one of: ${TEMPERATURES.join(', ')}.` };
  }
  if (!isOneOf(SWEETNESS_LEVELS, sweetness)) {
    return { ok: false, error: `sweetness must be one of: ${SWEETNESS_LEVELS.join(', ')}.` };
  }

  const servings = parseServings(input.servings);
  if (servings === null) {
    return { ok: false, error: 'servings must be a whole number from 1 to 12.' };
  }

  return {
    ok: true,
    value: {
      ingredients,
      drinkType,
      temperature,
      sweetness,
      servings,
      compatibility: parseCompatibility(input.compatibility),
    },
  };
}

function isOneOf<T extends string>(
  allowed: readonly T[],
  value: unknown,
): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

const COMPATIBILITY_STATUSES = ['good', 'unusual', 'problematic'] as const;

function parseCompatibility(value: unknown) {
  if (typeof value !== 'object' || value === null) return undefined;
  const note = value as Record<string, unknown>;
  if (!isOneOf(COMPATIBILITY_STATUSES, note.status)) return undefined;
  return {
    status: note.status,
    reason: shortText(note.reason, 240),
    suggestion: shortText(note.suggestion, 180),
  };
}

function parseServings(value: unknown): number | null {
  if (value === undefined) return 1;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return n;
}

function shortText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export const generateDrinkRouter = Router();

generateDrinkRouter.post('/', async (req, res) => {
  const parsed = parseRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    res.json(await generateDrinkRecipe(parsed.value));
  } catch (err) {
    // Log the message only: never the client, config, or key.
    console.error(
      '[generate-drink]',
      err instanceof Error ? err.message : 'Unknown error',
    );

    if (err instanceof GeminiConfigError) {
      res.status(503).json({
        error: 'Drink generation is not set up yet. Please try again later.',
      });
      return;
    }
    res.status(502).json({
      error: "We couldn't mix that drink right now. Please try again.",
    });
  }
});
