import type { DrinkType, Ingredient } from '../types';
import { blendDrinkColors } from '../utils/recipeEngine';

/** Sparse, menu-like placement around the vessel. */
const SCATTER: {
  top: string;
  left: string;
  rotate: string;
  size: 'sm' | 'md' | 'lg';
}[] = [
  { top: '4%', left: '38%', rotate: '-6deg', size: 'md' },
  { top: '8%', left: '14%', rotate: '10deg', size: 'lg' },
  { top: '6%', left: '72%', rotate: '-12deg', size: 'md' },
  { top: '24%', left: '2%', rotate: '4deg', size: 'md' },
  { top: '22%', left: '86%', rotate: '-3deg', size: 'lg' },
  { top: '42%', left: '-1%', rotate: '14deg', size: 'sm' },
  { top: '40%', left: '90%', rotate: '-8deg', size: 'md' },
  { top: '58%', left: '4%', rotate: '-14deg', size: 'lg' },
  { top: '55%', left: '88%', rotate: '7deg', size: 'sm' },
  { top: '74%', left: '8%', rotate: '3deg', size: 'md' },
  { top: '72%', left: '84%', rotate: '-10deg', size: 'lg' },
  { top: '84%', left: '22%', rotate: '11deg', size: 'sm' },
  { top: '86%', left: '68%', rotate: '-5deg', size: 'md' },
  { top: '90%', left: '42%', rotate: '8deg', size: 'md' },
  { top: '16%', left: '52%', rotate: '2deg', size: 'sm' },
  { top: '62%', left: '-2%', rotate: '-6deg', size: 'md' },
  { top: '32%', left: '94%', rotate: '15deg', size: 'sm' },
  { top: '78%', left: '48%', rotate: '-2deg', size: 'sm' },
  { top: '48%', left: '78%', rotate: '9deg', size: 'md' },
  { top: '12%', left: '28%', rotate: '-9deg', size: 'sm' },
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
        const pos = SCATTER[index % SCATTER.length];
        const used = inGlassIds.has(ing.id);
        const num = String(index + 1).padStart(2, '0');
        return (
          <button
            key={ing.id}
            type="button"
            className={`float-pic float-${pos.size}${used ? ' used' : ''}`}
            style={{
              top: pos.top,
              left: pos.left,
              ['--pic-color' as string]: ing.color,
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
            <span className="float-pic-face" aria-hidden>
              {ing.emoji}
            </span>
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
                    {ing.emoji}
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
