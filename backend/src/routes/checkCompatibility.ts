import { Router } from 'express';
import {
  GeminiConfigError,
  evaluateCompatibility,
} from '../services/gemini.js';

const MAX_INGREDIENTS = 12;
const INGREDIENT_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '’&-]{0,39}$/u;

export const checkCompatibilityRouter = Router();

checkCompatibilityRouter.post('/', async (req, res) => {
  const ingredients = parseIngredients(req.body);
  if (!ingredients) {
    res.status(400).json({ error: 'Send 2 to 12 ingredient names.' });
    return;
  }

  try {
    res.json(await evaluateCompatibility(ingredients));
  } catch (err) {
    console.error(
      '[check-compatibility]',
      err instanceof Error ? err.message : 'Unknown error',
    );
    if (err instanceof GeminiConfigError) {
      res.status(503).json({
        error: 'Drink generation is not set up yet. Please try again later.',
      });
      return;
    }
    res.status(502).json({
      error: "We couldn't check that combination right now.",
    });
  }
});

function parseIngredients(body: unknown): string[] | null {
  if (typeof body !== 'object' || body === null) return null;
  const list = (body as { ingredients?: unknown }).ingredients;
  if (!Array.isArray(list) || list.length < 2 || list.length > MAX_INGREDIENTS) return null;

  const seen = new Set<string>();
  const ingredients: string[] = [];
  for (const item of list) {
    const name = typeof item === 'string' ? item.trim() : '';
    if (!INGREDIENT_PATTERN.test(name)) return null;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      ingredients.push(name);
    }
  }
  return ingredients.length >= 2 ? ingredients : null;
}
