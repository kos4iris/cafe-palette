import { useEffect, useRef } from 'react';
import type { SavedRecipe } from '../utils/savedRecipes';

interface Props {
  recipe: SavedRecipe;
  onClose: () => void;
}

export function SavedRecipeModal({ recipe, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  const equipment = recipe.equipment ?? [];
  const sources = recipe.sources ?? [];

  return (
    <dialog
      ref={dialogRef}
      className="saved-modal"
      aria-labelledby="saved-modal-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="saved-modal-body">
        <button type="button" className="saved-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="saved-modal-title">{recipe.name}</h2>
        <p className="saved-card-desc">{recipe.description}</p>

        <h3>Ingredients</h3>
        <ul className="measure-list">
          {recipe.ingredients.map((line, index) => (
            <li key={`${line.name}-${index}`}>
              <span>
                {line.name}
                {line.userSelected === false && <span className="added-tag">added</span>}
              </span>
              <span>{line.amount}</span>
            </li>
          ))}
        </ul>

        {equipment.length > 0 && (
          <>
            <h3>Equipment</h3>
            <ul className="equipment">
              {equipment.map((item) => (
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

        {sources.length > 0 && (
          <>
            <h3>Sources</h3>
            <ul className="sources">
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </dialog>
  );
}
