import { useEffect, useRef, useState } from 'react';
import type { DrinkRecipe } from '../services/drinkApi';
import { findSavedRecipeId, saveRecipe } from '../utils/savedRecipes';
import { FlavorDetailsModal } from './FlavorDetailsModal';
import { RecipeSummary } from './RecipeSummary';
import { isFlavorProfile } from '../utils/flavorProfile';

interface Props {
  recipe: DrinkRecipe;
  onClose: () => void;
}

export function GeneratedRecipeModal({ recipe, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [savedId, setSavedId] = useState<string | null>(() => findSavedRecipeId(recipe));
  const [notice, setNotice] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const profile = isFlavorProfile(recipe.flavorProfile) ? recipe.flavorProfile : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(event: Event) {
      event.preventDefault();
      onClose();
    }
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [onClose]);

  useEffect(() => {
    setSavedId(findSavedRecipeId(recipe));
    setNotice(null);
    setDetailsOpen(false);
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
    <dialog
      ref={dialogRef}
      className="saved-modal"
      aria-labelledby="generated-recipe-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="saved-modal-body">
        <div className="details-strip" aria-hidden="true" />
        <button type="button" className="saved-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="generated-recipe-title">{recipe.name}</h2>
        <p className="saved-card-desc">{recipe.description}</p>

        <RecipeSummary recipe={recipe} />

        <h3>Ingredients</h3>
        <ul className="measure-list">
          {recipe.ingredients.map((line, index) => (
            <li key={`${line.name}-${index}`}>
              <span>
                {line.name}
                {!line.userSelected && <span className="added-tag">added</span>}
              </span>
              <span>{line.amount}</span>
            </li>
          ))}
        </ul>

        {recipe.topper?.name && recipe.topper.description && (
          <>
            <h3>Topper</h3>
            <p className="recipe-topper">
              {recipe.topper.name}. {recipe.topper.description}
            </p>
          </>
        )}

        {recipe.equipment.length > 0 && (
          <>
            <h3>Equipment</h3>
            <ul className="equipment">
              {recipe.equipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}

        <h3>Procedure</h3>
        <ol className="steps">
          {recipe.instructions.map((step) => (
            <li key={step.step}>{step.instruction}</li>
          ))}
        </ol>

        {recipe.sources.length > 0 && (
          <>
            <h3>Sources</h3>
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
          {profile && (
            <button type="button" className="details-toggle" onClick={() => setDetailsOpen(true)}>
              Details
            </button>
          )}
          {notice && (
            <p className="save-note" role="status">
              {notice}
            </p>
          )}
        </div>
      </div>
    </dialog>
      {profile && detailsOpen && (
        <FlavorDetailsModal
          profile={profile}
          onBack={() => setDetailsOpen(false)}
          onClose={onClose}
        />
      )}
    </>
  );
}
