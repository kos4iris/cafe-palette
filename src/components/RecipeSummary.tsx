import type { DrinkRecipe } from '../services/drinkApi';

export function RecipeSummary({ recipe }: { recipe: DrinkRecipe | null }) {
  if (!recipe) return null;

  const prep = recipe.prepTime;
  const servings = servingLabel(recipe.servings);
  const difficulty = recipe.difficulty;

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
        <span className="summary-stars" aria-label={`Difficulty ${difficulty} out of 5`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= difficulty ? 'is-on' : 'is-off'} aria-hidden>
              ★
            </span>
          ))}
        </span>
      </p>
    </section>
  );
}

function servingLabel(count: number): string {
  return count === 1 ? '1 serving' : `${count} servings`;
}
