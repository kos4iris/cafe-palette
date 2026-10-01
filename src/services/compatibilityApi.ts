import {
  COMPATIBILITY_TITLES,
  type CompatibilityResult,
} from '../utils/checkIngredientCompatibility';

const TIMEOUT_MS = 32_000;

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
    return {
      ...data,
      title: COMPATIBILITY_TITLES[data.status],
      suggestion: data.suggestion ?? null,
    };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

function isCompatibility(
  data: unknown,
): data is CompatibilityResult & { suggestion?: string | null } {
  if (typeof data !== 'object' || data === null) return false;
  const status = (data as { status?: unknown }).status;
  const reason = (data as { reason?: unknown }).reason;
  return (
    (status === 'good' || status === 'unusual' || status === 'problematic') &&
    typeof reason === 'string' &&
    reason.trim().length > 0
  );
}
