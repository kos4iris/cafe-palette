import type { CompatibilityResult } from '../utils/checkIngredientCompatibility';

const LABELS: Record<CompatibilityResult['status'], string> = {
  good: 'Great pairing',
  unusual: 'Interesting combination',
  problematic: 'Heads up',
};

export function CompatibilityNote({ result }: { result: CompatibilityResult | null }) {
  if (!result) return null;

  return (
    <p className={`compat compat-${result.status}`} role="status">
      <span className="compat-label">{LABELS[result.status]}</span>
      {result.reason && <span className="compat-reason">{result.reason}</span>}
      {result.suggestion && <span className="compat-suggestion">{result.suggestion}</span>}
    </p>
  );
}
