import type { DrinkRecipe } from '../services/drinkApi';
import { DIETARY_RESTRICTIONS } from '../types';

export function RecipeSummary({ recipe }: { recipe: DrinkRecipe | null }) {
  if (!recipe) return null;

  const prep = recipe.prepTime;
  const servings = servingLabel(recipe.servings);
  const difficulty = recipe.difficulty;
  const label = recipe.difficultyLabel || labelFor(difficulty);
  const diet = (recipe.dietaryRestrictions ?? [])
    .map((id) => DIETARY_RESTRICTIONS.find((item) => item.id === id)?.label ?? id)
    .join(', ');
  const conflict = recipe.dietaryConflict;

  return (
    <section className="menu-section recipe-summary" aria-label="Recipe summary">
      <p className="summary-row">
        <span className="summary-label">Prep</span>
        <span className="summary-value">{prep}</span>
      </p>
      <p className="summary-row">
        <span className="summary-label">Serves</span>
        <span className="summary-value">{servings}</span>
      </p>
      <p className="summary-row">
        <span className="summary-label">Difficulty</span>
        <span className="summary-stars" aria-label={`Difficulty ${difficulty} out of 5, ${label}`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= difficulty ? 'is-on' : 'is-off'} aria-hidden>
              {star <= difficulty ? '★' : '☆'}
            </span>
          ))}
        </span>
        <span className="summary-note">{label}</span>
      </p>
      {diet && (
        <p className="summary-row summary-diet">
          <span className="summary-label">Diet</span>
          <span className="summary-value">{diet}</span>
        </p>
      )}
      {conflict?.hasConflict && conflict.message && (
        <p className="diet-conflict" role="status">
          {conflict.message}
          {conflict.suggestion && <span className="compat-suggestion">{conflict.suggestion}</span>}
        </p>
      )}
    </section>
  );
}

function servingLabel(count: number): string {
  return count === 1 ? '1 serving' : `${count} servings`;
}

function labelFor(score: number): string {
  return ['Very easy', 'Easy', 'Moderate', 'Advanced', 'Very advanced'][score - 1] ?? 'Moderate';
}
