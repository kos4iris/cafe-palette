import type { Ingredient } from '../types';

interface Props {
  selected: Ingredient[];
  onRemove: (id: string) => void;
}

export function SelectedBubbles({ selected, onRemove }: Props) {
  if (selected.length === 0) return null;

  return (
    <div className="selected-tray">
      <ul className="selected-bubbles">
        {selected.map((ingredient) => (
          <li key={ingredient.id} className="selected-bubble">
            {ingredient.art ? (
              <img src={ingredient.art} alt="" />
            ) : (
              <span className="selected-emoji" aria-hidden>
                {ingredient.emoji}
              </span>
            )}
            <button
              type="button"
              className="bubble-remove"
              onClick={() => onRemove(ingredient.id)}
              aria-label={`Remove ${ingredient.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
