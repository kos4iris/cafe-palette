import { useState } from 'react';
import { Link } from 'react-router-dom';
import bloom from '../assets/saved-bloom.jpg';
import { FlavorMap } from '../components/FlavorMap';
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
  const open = plotted.find((recipe) => recipe.id === openId) ?? null;

  return (
    <div className="flavor-page">
      <img className="flavor-bloom" src={bloom} alt="" />
      <header className="flavor-header">
        <h1>Flavor Profile</h1>
        <p className="flavor-lead">See where your saved drinks live on your flavor palette.</p>
      </header>

      {plotted.length === 0 ? (
        <div className="saved-empty">
          <p>Your flavor palette is empty.</p>
          <p>Save some drinks to start building your flavor profile.</p>
          {skipped > 0 && <p>Some older recipes don't have flavor data yet.</p>}
          <Link to="/" className="saved-back">
            Create a drink
          </Link>
        </div>
      ) : (
        <>
          {skipped > 0 && (
            <p className="flavor-note">Some older recipes don't have flavor data yet.</p>
          )}
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
            </dl>
          </div>
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

function extreme(recipes: PlottedRecipe[], key: keyof FlavorProfile): PlottedRecipe {
  return recipes.reduce((best, recipe) => {
    const score = scoreOutOfTen(recipe.flavorProfile[key]);
    const bestScore = scoreOutOfTen(best.flavorProfile[key]);
    if (score > bestScore) return recipe;
    if (score === bestScore && recipe.savedAt > best.savedAt) return recipe;
    return best;
  });
}
