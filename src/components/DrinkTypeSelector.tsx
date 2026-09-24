import type { DrinkType } from '../types';

interface DrinkTypeProps {
  value: DrinkType;
  onChange: (t: DrinkType) => void;
  options: { id: DrinkType; label: string; emoji: string }[];
}

export function DrinkTypeSelector({ value, onChange, options }: DrinkTypeProps) {
  return (
    <div className="drink-types" role="radiogroup" aria-label="Drink style">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          className={value === opt.id ? 'type-pill active' : 'type-pill'}
          onClick={() => onChange(opt.id)}
        >
          <span aria-hidden>{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
