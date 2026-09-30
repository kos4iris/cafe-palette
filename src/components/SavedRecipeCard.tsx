import type { SavedRecipe } from '../utils/savedRecipes';

interface Props {
  recipe: SavedRecipe;
  onOpen: (recipe: SavedRecipe) => void;
  onRemove: (id: string) => void;
}

function formatSavedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SavedRecipeCard({ recipe, onOpen, onRemove }: Props) {
  const preview = recipe.ingredients
    .slice(0, 3)
    .map((item) => item.name)
    .join(' · ');
  const date = formatSavedDate(recipe.savedAt);

  return (
    <article className="saved-card" onClick={() => onOpen(recipe)}>
      <h2 className="saved-card-name">{recipe.name}</h2>
      <p className="saved-card-desc">{recipe.description}</p>
      {preview && <p className="saved-card-ings">{preview}</p>}
      {date && <p className="saved-card-date">Saved {date}</p>}
      <div className="saved-card-actions">
        <button
          type="button"
          className="saved-view"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(recipe);
          }}
        >
          View recipe
        </button>
        <button
          type="button"
          className="saved-remove"
          aria-label={`Remove ${recipe.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(recipe.id);
          }}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
