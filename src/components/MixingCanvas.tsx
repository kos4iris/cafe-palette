import type { DrinkType, Ingredient } from '../types';
import { blendDrinkColors } from '../utils/recipeEngine';

/**
 * Sparse, menu-like ring around the vessel. `top`/`left` are element centres
 * and steer clear of the glass zone (x 36–64%, y 30–80%).
 */
const SCATTER: {
  top: string;
  left: string;
  rotate: string;
  size: 'sm' | 'md' | 'lg';
}[] = [
  { top: '11%', left: '11%', rotate: '-7deg', size: 'lg' },
  { top: '27%', left: '8%', rotate: '9deg', size: 'lg' },
  { top: '43%', left: '9%', rotate: '-4deg', size: 'md' },
  { top: '59%', left: '8%', rotate: '12deg', size: 'sm' },
  { top: '74%', left: '11%', rotate: '-10deg', size: 'lg' },
  { top: '88%', left: '15%', rotate: '5deg', size: 'md' },
  { top: '9%', left: '89%', rotate: '8deg', size: 'lg' },
  { top: '25%', left: '92%', rotate: '-6deg', size: 'lg' },
  { top: '41%', left: '92%', rotate: '14deg', size: 'sm' },
  { top: '57%', left: '91%', rotate: '-3deg', size: 'md' },
  { top: '72%', left: '89%', rotate: '10deg', size: 'sm' },
  { top: '87%', left: '84%', rotate: '-8deg', size: 'md' },
  { top: '7%', left: '31%', rotate: '6deg', size: 'md' },
  { top: '10%', left: '45%', rotate: '-11deg', size: 'sm' },
  { top: '7%', left: '59%', rotate: '3deg', size: 'sm' },
  { top: '91%', left: '32%', rotate: '-5deg', size: 'sm' },
  { top: '93%', left: '46%', rotate: '9deg', size: 'sm' },
  { top: '90%', left: '60%', rotate: '-2deg', size: 'md' },
  { top: '19%', left: '23%', rotate: '11deg', size: 'sm' },
  { top: '18%', left: '76%', rotate: '-9deg', size: 'sm' },
  { top: '82%', left: '25%', rotate: '4deg', size: 'sm' },
  { top: '84%', left: '73%', rotate: '-13deg', size: 'sm' },
];

interface Props {
  pantry: Ingredient[];
  inGlass: Ingredient[];
  drinkType: DrinkType;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isDragOver: boolean;
  setDragOver: (v: boolean) => void;
}

export function MixingCanvas({
  pantry,
  inGlass,
  drinkType,
  onAdd,
  onRemove,
  isDragOver,
  setDragOver,
}: Props) {
  const { layers, blended } = blendDrinkColors(inGlass);
  const fillPercent = Math.min(16 + inGlass.length * 11, 86);
  const inGlassIds = new Set(inGlass.map((i) => i.id));

  const layerGradient =
    layers.length === 0
      ? 'transparent'
      : layers.length === 1
        ? layers[0]
        : `linear-gradient(180deg, ${layers
            .map((c, i) => `${c} ${(i / layers.length) * 100}%`)
            .join(', ')})`;

  return (
    <div className={`mixing-canvas halo-${drinkType}`}>
      <div className="halo" aria-hidden />
      <div className="halo-grain" aria-hidden />

      {pantry.map((ing, index) => {
        // Spread a small pantry evenly around the ring instead of bunching it up.
        const stride = Math.max(1, Math.floor(SCATTER.length / pantry.length));
        const pos = SCATTER[(index * stride) % SCATTER.length];
        const used = inGlassIds.has(ing.id);
        const num = String(index + 1).padStart(2, '0');
        return (
          <button
            key={ing.id}
            type="button"
            className={[
              'float-pic',
              `float-${pos.size}`,
              ing.art ? 'has-art' : '',
              used ? 'used' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              top: pos.top,
              left: pos.left,
              ['--pic-rotate' as string]: pos.rotate,
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', ing.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => onAdd(ing.id)}
            aria-label={`Add ${ing.name}`}
            aria-pressed={used}
            title={ing.name}
          >
            <span className="float-num" aria-hidden>
              {num}
            </span>
            {ing.art ? (
              <img className="float-art" src={ing.art} alt="" draggable={false} />
            ) : (
              <span className="float-pic-face" aria-hidden>
                {ing.emoji}
              </span>
            )}
          </button>
        );
      })}

      <div
        className={isDragOver ? 'glass-dropzone drag-over' : 'glass-dropzone'}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const id = e.dataTransfer.getData('text/plain');
          if (id) onAdd(id);
        }}
      >
        <div className="glass" aria-label="Drink glass">
          <div className="glass-rim" />
          <div className="glass-body">
            <div
              className="drink-fill"
              style={{
                height: `${fillPercent}%`,
                background:
                  layers.length > 1
                    ? `linear-gradient(180deg, ${blended}dd, ${layerGradient})`
                    : blended === 'transparent'
                      ? 'transparent'
                      : `linear-gradient(180deg, ${blended}bb, ${blended})`,
              }}
            />
            <ul className="glass-bits">
              {inGlass.map((ing, index) => (
                <li
                  key={ing.id}
                  className="glass-bit"
                  style={{
                    left: `${20 + ((index * 19) % 52)}%`,
                    bottom: `${14 + ((index * 15) % 46)}%`,
                  }}
                >
                  <button
                    type="button"
                    className="bit-btn"
                    onClick={() => onRemove(ing.id)}
                    aria-label={`Remove ${ing.name}`}
                    title={`Remove ${ing.name}`}
                  >
                    {ing.art ? (
                      <img className="bit-art" src={ing.art} alt="" />
                    ) : (
                      ing.emoji
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-shine" aria-hidden />
        </div>
      </div>
    </div>
  );
}
