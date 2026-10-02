import { INGREDIENTS } from '../data/ingredients';

/** Spellings of one word, so "cherries" and "cherry" can match. */
function stems(word: string): string[] {
  const forms = new Set<string>([word]);
  if (word.endsWith('ies') && word.length > 4) forms.add(`${word.slice(0, -3)}y`);
  if (word.endsWith('es') && word.length > 3) forms.add(word.slice(0, -2));
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) forms.add(word.slice(0, -1));
  return [...forms];
}

function keys(value: string): string[] {
  const parts = value
    .trim()
    .toLowerCase()
    .replace(/^freshly squeezed\s+/, '')
    .replace(/^freshly\s+/, '')
    .replace(/^fresh\s+/, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (parts.length === 0) return [];
  const head = parts.slice(0, -1);
  return stems(parts[parts.length - 1]).map((last) => [...head, last].join(''));
}

const CATALOG = INGREDIENTS.map((item) => ({
  name: item.name,
  keys: keys(item.name),
}));

/** Catalog name when the recipe wording is the same ingredient, otherwise a steady label. */
export function previewIngredientName(name: string): string {
  const nameKeys = keys(name);
  const exact = CATALOG.filter((item) => item.keys.some((key) => nameKeys.includes(key)));
  if (exact.length > 0) {
    return exact.sort((a, b) => b.name.length - a.name.length)[0].name;
  }

  const contained = CATALOG.filter((item) =>
    item.keys.some((key) => key.length > 2 && nameKeys.some((form) => form.includes(key))),
  );
  if (contained.length > 0) {
    return contained.sort((a, b) => b.name.length - a.name.length)[0].name;
  }

  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
