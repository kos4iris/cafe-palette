import {
  SWEETNESS_LEVELS,
  TEMPERATURES,
  type Sweetness,
  type Temperature,
} from '../types';

interface Props {
  temperature: Temperature;
  sweetness: Sweetness;
  servings: number;
  onTemperature: (t: Temperature) => void;
  onSweetness: (s: Sweetness) => void;
  onServings: (n: number) => void;
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
  onTemperature,
  onSweetness,
  onServings,
  canGenerate,
  isGenerating,
  onGenerate,
}: Props) {
  return (
    <section className="generate menu-section" aria-label="Drink preferences">
      <h3 className="menu-section-label">Preferences</h3>
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
