import type { CompatibilityFeedback } from '../hooks/useIngredientCompatibility';
import type { Ingredient } from '../types';
import { CompatibilityNote } from './CompatibilityNote';

interface Props {
  selected: Ingredient[];
  onRemove: (id: string) => void;
  onClear: () => void;
  compatibility: CompatibilityFeedback;
}

export function SelectedIngredients({ selected, onRemove, onClear, compatibility }: Props) {
  return (
    <section className="menu-section selected-ingredients" aria-label="Selected ingredients">
      <div className="selected-heading">
        <h3 className="menu-section-label">Selected</h3>
        {selected.length > 0 && (
          <button type="button" className="clear-all" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      {selected.length === 0 ? (
        <p className="empty">None yet.</p>
      ) : (
        <ul className="menu-index">
          {selected.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.art ? (
                <img className="menu-thumb" src={ingredient.art} alt="" />
              ) : (
                <span className="menu-thumb" aria-hidden>
                  {ingredient.emoji}
                </span>
              )}
              <span className="menu-item-name">{ingredient.name}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemove(ingredient.id)}
                aria-label={`Remove ${ingredient.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <CompatibilityNote feedback={compatibility} />
    </section>
  );
}
