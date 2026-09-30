import type { CompatibilityResult } from '../utils/checkIngredientCompatibility';

const TIMEOUT_MS = 20_000;

export async function checkCompatibility(
  ingredients: string[],
  signal: AbortSignal,
): Promise<CompatibilityResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort);

  try {
    const response = await fetch('/api/check-compatibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !isCompatibility(data)) {
      throw new Error('Compatibility check failed');
    }
    return data;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

function isCompatibility(data: unknown): data is CompatibilityResult {
  if (typeof data !== 'object' || data === null) return false;
  const status = (data as { status?: unknown }).status;
  return status === 'good' || status === 'unusual' || status === 'problematic';
}
