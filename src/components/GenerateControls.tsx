import {
  SWEETNESS_LEVELS,
  TEMPERATURES,
  type Sweetness,
  type Temperature,
} from '../types';

interface Props {
  temperature: Temperature;
  sweetness: Sweetness;
  onTemperature: (t: Temperature) => void;
  onSweetness: (s: Sweetness) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function GenerateControls({
  temperature,
  sweetness,
  onTemperature,
  onSweetness,
  canGenerate,
  isGenerating,
  onGenerate,
}: Props) {
  return (
    <section className="generate" aria-label="Drink preferences">
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
