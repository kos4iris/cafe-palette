import {
  DIETARY_RESTRICTIONS,
  SWEETNESS_LEVELS,
  TEMPERATURES,
  type DietaryRestriction,
  type Sweetness,
  type Temperature,
} from '../types';

interface Props {
  temperature: Temperature;
  sweetness: Sweetness;
  servings: number;
  dietaryRestrictions: DietaryRestriction[];
  onTemperature: (t: Temperature) => void;
  onSweetness: (s: Sweetness) => void;
  onServings: (n: number) => void;
  onDietaryRestrictions: (restrictions: DietaryRestriction[]) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;

export function GenerateControls({
  temperature,
  sweetness,
  servings,
  dietaryRestrictions,
  onTemperature,
  onSweetness,
  onServings,
  onDietaryRestrictions,
  canGenerate,
  isGenerating,
  onGenerate,
}: Props) {
  return (
    <section className="generate menu-section" aria-label="Drink preferences">
      <h3 className="menu-section-label">Preferences</h3>
      <div className="pref-row pref-row-diet">
        <span className="pref-label" id="pref-diet">
          Dietary Restrictions
        </span>
        <div className="pref-options diet-options" role="group" aria-labelledby="pref-diet">
          <button
            type="button"
            className={dietaryRestrictions.length === 0 ? 'diet-chip is-selected' : 'diet-chip'}
            aria-pressed={dietaryRestrictions.length === 0}
            onClick={() => onDietaryRestrictions([])}
          >
            None
          </button>
          {DIETARY_RESTRICTIONS.map((opt) => {
            const selected = dietaryRestrictions.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={selected ? 'diet-chip is-selected' : 'diet-chip'}
                aria-pressed={selected}
                onClick={() =>
                  onDietaryRestrictions(
                    selected
                      ? dietaryRestrictions.filter((id) => id !== opt.id)
                      : [...dietaryRestrictions, opt.id],
                  )
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pref-row">
        <span className="pref-label" id="pref-temp">
          Temperature
        </span>
        <div className="pref-options" role="radiogroup" aria-labelledby="pref-temp">
          {TEMPERATURES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={temperature === opt.id}
              className={temperature === opt.id ? 'type-link active' : 'type-link'}
              onClick={() => onTemperature(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pref-row">
        <span className="pref-label" id="pref-sweet">
          Sweetness
        </span>
        <div className="pref-options" role="radiogroup" aria-labelledby="pref-sweet">
          {SWEETNESS_LEVELS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={sweetness === opt.id}
              className={sweetness === opt.id ? 'type-link active' : 'type-link'}
              onClick={() => onSweetness(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pref-row">
        <label className="pref-label" htmlFor="pref-servings">
          Servings
        </label>
        <input
          id="pref-servings"
          className="servings-input"
          type="number"
          inputMode="numeric"
          min={MIN_SERVINGS}
          max={MAX_SERVINGS}
          step={1}
          value={servings}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            if (!Number.isInteger(next)) return;
            onServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, next)));
          }}
        />
      </div>

      <button
        type="button"
        className="generate-btn"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        aria-busy={isGenerating}
      >
        {isGenerating ? 'Mixing your drink...' : 'Generate My Drink'}
      </button>
    </section>
  );
}
