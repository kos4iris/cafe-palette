import { useState } from 'react';
import { Link } from 'react-router-dom';
import bloom from '../assets/saved-bloom.jpg';
import { SavedRecipeCard } from '../components/SavedRecipeCard';
import { SavedRecipeModal } from '../components/SavedRecipeModal';
import { getSavedRecipes, removeSavedRecipe, type SavedRecipe } from '../utils/savedRecipes';

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() => getSavedRecipes());
  const [open, setOpen] = useState<SavedRecipe | null>(null);

  function handleRemove(id: string) {
    removeSavedRecipe(id);
    setRecipes(getSavedRecipes());
    setOpen((current) => (current?.id === id ? null : current));
  }

  return (
    <div className="saved-page">
      <img className="saved-bloom" src={bloom} alt="" />
      <header className="saved-header">
        <h1>Saved Recipes</h1>
        <p className="saved-lead">your favorite drink recipes.</p>
      </header>

      {recipes.length === 0 ? (
        <div className="saved-empty">
          <p>No recipes saved yet.</p>
          <p>Create a drink and save it to build your palette.</p>
          <Link to="/" className="saved-back">
            Create a drink
          </Link>
        </div>
      ) : (
        <ul className="saved-grid">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <SavedRecipeCard recipe={recipe} onOpen={setOpen} onRemove={handleRemove} />
            </li>
          ))}
        </ul>
      )}

      {open && <SavedRecipeModal recipe={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
