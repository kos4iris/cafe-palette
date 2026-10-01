import type { CompatibilityFeedback } from '../hooks/useIngredientCompatibility';

export function CompatibilityNote({ feedback }: { feedback: CompatibilityFeedback }) {
  if (feedback.kind === 'empty') return null;

  const { result } = feedback;
  return (
    <p className={`compat compat-${result.status}`} role="status">
      <span className="compat-label">{result.title}</span>
      {result.reason && <span className="compat-reason">{result.reason}</span>}
      {result.suggestion && <span className="compat-suggestion">{result.suggestion}</span>}
    </p>
  );
}
