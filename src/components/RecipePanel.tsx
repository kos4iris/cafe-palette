import { useEffect, useState, type ReactNode } from 'react';
import type { DrinkRecipe } from '../services/drinkApi';
import type { Ingredient } from '../types';
import { findSavedRecipeId, saveRecipe } from '../utils/savedRecipes';

interface Props {
  selected: Ingredient[];
  /** Recipe from the backend for the current selection, if any. */
  aiRecipe: DrinkRecipe | null;
  isGenerating: boolean;
  error: string | null;
  onRemove: (id: string) => void;
  onClear: () => void;
  /** Preference controls, rendered between the selection and the recipe. */
  children?: ReactNode;
}

export function RecipePanel({
  selected,
  aiRecipe,
  isGenerating,
  error,
  onRemove,
  onClear,
  children,
}: Props) {
  return (
    <aside className="menu-panel">
      <header className="menu-header">
        <h2>Menu</h2>
      </header>

      <section className="menu-section" aria-label="Selected ingredients">
        <div className="recipe-title-row">
          <h3 className="menu-section-label">Selected</h3>
          {selected.length > 0 && (
            <button type="button" className="text-btn" onClick={onClear}>
              clear
            </button>
          )}
        </div>
        {selected.length === 0 ? (
          <p className="empty">Add at least 3 ingredients.</p>
        ) : (
          <ul className="menu-index">
            {selected.map((ing, i) => (
              <li key={ing.id}>
                <span className="menu-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="menu-item-name">
                  {ing.art ? (
                    <img className="menu-thumb" src={ing.art} alt="" />
                  ) : (
                    <span aria-hidden>{ing.emoji}</span>
                  )}{' '}
                  {ing.name}
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

      {children}

      <section className="menu-section recipe-card" aria-live="polite">
        <h3 className="menu-section-label recipe-label">Recipe</h3>
        {isGenerating ? (
          <p className="empty recipe-wait mixing">Mixing your drink...</p>
        ) : (
          <>
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}

            {aiRecipe ? (
              <AiRecipeView recipe={aiRecipe} />
            ) : (
              !error && (
                <p className="empty recipe-wait">Your recipe will show up here.</p>
              )
            )}
          </>
        )}
      </section>
    </aside>
  );
}

function AiRecipeView({ recipe }: { recipe: DrinkRecipe }) {
  const [savedId, setSavedId] = useState<string | null>(() => findSavedRecipeId(recipe));
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setSavedId(findSavedRecipeId(recipe));
    setNotice(null);
  }, [recipe]);

  function handleSave() {
    try {
      const saved = saveRecipe(recipe);
      setSavedId(saved.id);
      setNotice('Saved to your palette');
    } catch {
      setNotice("Couldn't save this recipe.");
    }
  }

  return (
    <>
      <h3 className="drink-name">{recipe.name}</h3>
      <p className="drink-desc">{recipe.description}</p>

      <h4>Ingredients</h4>
      <ul className="measure-list">
        {recipe.ingredients.map((line, i) => (
          <li key={`${line.name}-${i}`}>
            <span>
              {line.name}
              {!line.userSelected && <span className="added-tag">added</span>}
            </span>
            <span>{line.amount}</span>
          </li>
        ))}
      </ul>

      {recipe.equipment.length > 0 && (
        <>
          <h4 className="equipment-label">Equipment</h4>
          <ul className="equipment">
            {recipe.equipment.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <section className="recipe-block">
        <h4>Procedure</h4>
        <ol className="steps">
          {recipe.instructions.map((step) => (
            <li key={step.step}>{step.instruction}</li>
          ))}
        </ol>
      </section>

      {recipe.sources.length > 0 && (
        <>
          <h4>Sources</h4>
          <ul className="sources">
            {recipe.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="save-recipe-row">
        <button
          type="button"
          className="save-recipe"
          onClick={handleSave}
          disabled={savedId !== null}
        >
          {savedId ? 'Saved' : 'Save Recipe'}
        </button>
        {notice && (
          <p className="save-note" role="status">
            {notice}
          </p>
        )}
      </div>
    </>
  );
}

