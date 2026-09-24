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
          className={value === opt.id ? 'type-link active' : 'type-link'}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
