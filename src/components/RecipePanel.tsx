import { useEffect, useState, type ReactNode } from 'react';
import type { DrinkRecipe } from '../services/drinkApi';
import type { CompatibilityResult } from '../utils/checkIngredientCompatibility';
import { CompatibilityNote } from './CompatibilityNote';
import { GeneratedRecipeModal } from './GeneratedRecipeModal';

interface Props {
  /** Recipe from the backend for the current selection, if any. */
  aiRecipe: DrinkRecipe | null;
  error: string | null;
  compatibility: CompatibilityResult | null;
  /** Preference controls, rendered above the recipe. */
  children?: ReactNode;
}

export function RecipePanel({ aiRecipe, error, compatibility, children }: Props) {
  const [recipeOpen, setRecipeOpen] = useState(false);

  useEffect(() => {
    setRecipeOpen(Boolean(aiRecipe));
  }, [aiRecipe]);

  return (
    <>
      <aside className="menu-panel">
        <header className="menu-header">
          <h2>Menu</h2>
        </header>

        {children}

        <CompatibilityNote result={compatibility} />

        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}

        {aiRecipe && !recipeOpen && (
          <button type="button" className="view-recipe" onClick={() => setRecipeOpen(true)}>
            View recipe
          </button>
        )}
      </aside>

      {aiRecipe && recipeOpen && (
        <GeneratedRecipeModal recipe={aiRecipe} onClose={() => setRecipeOpen(false)} />
      )}
    </>
  );
}
