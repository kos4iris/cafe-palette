import { useState } from 'react';
import { Link } from 'react-router-dom';
import bloom from '../assets/saved-bloom.jpg';
import { FlavorMap } from '../components/FlavorMap';
import { IngredientNetwork } from '../components/IngredientNetwork';
import { SavedRecipeModal } from '../components/SavedRecipeModal';
import type { FlavorProfile } from '../services/drinkApi';
import { isFlavorProfile, scoreOutOfTen } from '../utils/flavorProfile';
import { getSavedRecipes, type SavedRecipe } from '../utils/savedRecipes';

type PlottedRecipe = SavedRecipe & { flavorProfile: FlavorProfile };

export default function FlavorProfilePage() {
  const [recipes] = useState<SavedRecipe[]>(() => getSavedRecipes());
  const [openId, setOpenId] = useState<string | null>(null);
  const plotted = recipes.filter(hasFlavor);
  const skipped = recipes.length - plotted.length;
  const open = recipes.find((recipe) => recipe.id === openId) ?? null;

  return (
    <div className="flavor-page">
      <img className="flavor-bloom" src={bloom} alt="" />
      <header className="flavor-header">
        <h1>Flavor Profile</h1>
        <p className="flavor-lead">See where your saved drinks live on your flavor palette.</p>
      </header>

      {recipes.length === 0 ? (
        <div className="saved-empty">
          <p>Your flavor palette is empty.</p>
          <p>Save some drinks to start building your flavor profile.</p>
          <Link to="/" className="saved-back">
            Create a drink
          </Link>
        </div>
      ) : (
        <>
          <section
            className={plotted.length === 0 ? 'flavor-map-block is-unplotted' : 'flavor-map-block'}
            aria-labelledby="flavor-map-title"
          >
            <h2 id="flavor-map-title" className="flavor-section-title">
              Flavor Map
            </h2>
            {skipped > 0 && (
              <p className="flavor-note">Some older recipes don't have flavor data yet.</p>
            )}
            {plotted.length === 0 ? (
              <div className="saved-empty">
                <p>Your flavor palette is empty.</p>
                <p>Save some drinks to start building your flavor profile.</p>
              </div>
            ) : (
              <div className="flavor-stage">
                <FlavorMap
                  recipes={plotted.map((recipe) => ({
                    id: recipe.id,
                    name: recipe.name,
                    profile: recipe.flavorProfile,
                  }))}
                  onSelect={setOpenId}
                />
                <dl className="flavor-stats">
                  <div>
                    <dt>Saved drinks</dt>
                    <dd>{plotted.length}</dd>
                  </div>
                  <Extreme label="Sweetest" recipe={extreme(plotted, 'sweet')} />
                  <Extreme label="Most tart" recipe={extreme(plotted, 'tart')} />
                  <Extreme label="Richest" recipe={extreme(plotted, 'rich')} />
                  <Extreme label="Lightest" recipe={extreme(plotted, 'light')} />
                  <div>
                    <dt>Most popular ingredient</dt>
                    <dd>{mostPopularIngredient(plotted)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>

          <section className="network-section" aria-labelledby="ingredient-network-title">
            <h2 id="ingredient-network-title" className="flavor-section-title">
              Ingredient Network
            </h2>
            <p className="network-lead">See which ingredients connect your saved drinks.</p>
            <IngredientNetwork recipes={recipes} onSelectDrink={setOpenId} />
          </section>
        </>
      )}

      {open && <SavedRecipeModal recipe={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function Extreme({ label, recipe }: { label: string; recipe: PlottedRecipe }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{recipe.name}</dd>
    </div>
  );
}

function hasFlavor(recipe: SavedRecipe): recipe is PlottedRecipe {
  return isFlavorProfile(recipe.flavorProfile);
}

function mostPopularIngredient(recipes: PlottedRecipe[]): string {
  const counts = new Map<string, { name: string; count: number; savedAt: string }>();

  for (const recipe of recipes) {
    const seen = new Set<string>();
    for (const item of recipe.ingredients) {
      if (item.userSelected !== true) continue;
      const key = item.name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const current = counts.get(key);
      if (!current) {
        counts.set(key, { name: item.name.trim(), count: 1, savedAt: recipe.savedAt });
        continue;
      }
      current.count += 1;
      if (recipe.savedAt >= current.savedAt) {
        current.savedAt = recipe.savedAt;
        current.name = item.name.trim();
      }
    }
  }

  let best: { name: string; count: number; savedAt: string } | null = null;
  for (const item of counts.values()) {
    if (
      !best ||
      item.count > best.count ||
      (item.count === best.count && item.savedAt > best.savedAt)
    ) {
      best = item;
    }
  }
  return best?.name ?? '—';
}

function extreme(recipes: PlottedRecipe[], key: keyof FlavorProfile): PlottedRecipe {
  return recipes.reduce((best, recipe) => {
    const score = scoreOutOfTen(recipe.flavorProfile[key]);
    const bestScore = scoreOutOfTen(best.flavorProfile[key]);
    if (score > bestScore) return recipe;
    if (score === bestScore && recipe.savedAt > best.savedAt) return recipe;
    return best;
  });
}
