import type { GeneratedRecipe, Ingredient } from '../types';

interface Props {
  selected: Ingredient[];
  recipe: GeneratedRecipe | null;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function RecipePanel({ selected, recipe, onRemove, onClear }: Props) {
  return (
    <aside className="panel recipe-panel">
      <header className="panel-header">
        <p className="eyebrow">Your pour</p>
        <div className="recipe-title-row">
          <h2>Recipe</h2>
          {selected.length > 0 && (
            <button type="button" className="text-btn" onClick={onClear}>
              Clear all
            </button>
          )}
        </div>
      </header>

      <section className="current-list" aria-label="Current ingredients">
        <h3>In the glass</h3>
        {selected.length === 0 ? (
          <p className="empty">Nothing yet — start with a fruit and a base.</p>
        ) : (
          <ul>
            {selected.map((ing) => (
              <li key={ing.id}>
                <span>
                  {ing.emoji} {ing.name}
                </span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemove(ing.id)}
                  aria-label={`Remove ${ing.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="recipe-card" aria-live="polite">
        {!recipe ? (
          <div className="recipe-placeholder">
            <p>
              Add <strong>one flavor</strong> and <strong>one liquid base</strong>{' '}
              to unlock a recipe.
            </p>
          </div>
        ) : (
          <>
            <h3 className="drink-name">{recipe.name}</h3>

            {recipe.unusual && recipe.unusualMessage && (
              <p className="unusual-note" role="status">
                {recipe.unusualMessage}
              </p>
            )}

            <h4>Ingredients</h4>
            <ul className="measure-list">
              {recipe.ingredients.map((line) => (
                <li key={line.ingredientId}>
                  <span>{line.quantity}</span>
                  <span>{line.name}</span>
                </li>
              ))}
            </ul>

            <h4>Instructions</h4>
            <ol className="steps">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </>
        )}
      </section>
    </aside>
  );
}
