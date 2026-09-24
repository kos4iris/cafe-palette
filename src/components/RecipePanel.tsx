import type { GeneratedRecipe, Ingredient } from '../types';

interface Props {
  selected: Ingredient[];
  recipe: GeneratedRecipe | null;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function RecipePanel({ selected, recipe, onRemove, onClear }: Props) {
  return (
    <aside className="menu-panel">
      <header className="menu-header">
        <div className="recipe-title-row">
          <h2>Menu</h2>
          {selected.length > 0 && (
            <button type="button" className="text-btn" onClick={onClear}>
              clear
            </button>
          )}
        </div>
        <p className="menu-note">Selected ingredients & recipe</p>
      </header>

      <section className="current-list" aria-label="Current ingredients">
        {selected.length === 0 ? (
          <p className="empty">
            Drag pictures into the glass — one flavor, one base.
          </p>
        ) : (
          <ul className="menu-index">
            {selected.map((ing, i) => (
              <li key={ing.id}>
                <span className="menu-idx">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="menu-item-name">
                  <span aria-hidden>{ing.emoji}</span> {ing.name}
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

      <div className="menu-rule" aria-hidden />

      <section className="recipe-card" aria-live="polite">
        {!recipe ? (
          <p className="empty recipe-wait">Recipe appears when the pour is ready.</p>
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
                  <span>{line.name}</span>
                  <span>{line.quantity}</span>
                </li>
              ))}
            </ul>

            <h4>Method</h4>
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
