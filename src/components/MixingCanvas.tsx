import type { Ingredient } from '../types';
import { blendDrinkColors } from '../utils/recipeEngine';

/** Organic scatter around the glass — percent of the stage. */
const SCATTER: { top: string; left: string; rotate: string; size: 'sm' | 'md' | 'lg' }[] = [
  { top: '6%', left: '42%', rotate: '-8deg', size: 'md' },
  { top: '10%', left: '18%', rotate: '12deg', size: 'lg' },
  { top: '8%', left: '68%', rotate: '-14deg', size: 'md' },
  { top: '22%', left: '4%', rotate: '6deg', size: 'md' },
  { top: '20%', left: '82%', rotate: '-4deg', size: 'lg' },
  { top: '38%', left: '0%', rotate: '16deg', size: 'sm' },
  { top: '36%', left: '88%', rotate: '-10deg', size: 'md' },
  { top: '52%', left: '6%', rotate: '-18deg', size: 'lg' },
  { top: '50%', left: '86%', rotate: '8deg', size: 'sm' },
  { top: '68%', left: '2%', rotate: '4deg', size: 'md' },
  { top: '66%', left: '90%', rotate: '-12deg', size: 'lg' },
  { top: '78%', left: '14%', rotate: '14deg', size: 'sm' },
  { top: '80%', left: '74%', rotate: '-6deg', size: 'md' },
  { top: '88%', left: '32%', rotate: '10deg', size: 'md' },
  { top: '86%', left: '54%', rotate: '-16deg', size: 'lg' },
  { top: '14%', left: '50%', rotate: '5deg', size: 'sm' },
  { top: '58%', left: '-2%', rotate: '-8deg', size: 'md' },
  { top: '30%', left: '94%', rotate: '18deg', size: 'sm' },
  { top: '72%', left: '42%', rotate: '-3deg', size: 'sm' },
  { top: '44%', left: '78%', rotate: '11deg', size: 'md' },
];

interface Props {
  pantry: Ingredient[];
  inGlass: Ingredient[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isDragOver: boolean;
  setDragOver: (v: boolean) => void;
}

export function MixingCanvas({
  pantry,
  inGlass,
  onAdd,
  onRemove,
  isDragOver,
  setDragOver,
}: Props) {
  const { layers, blended } = blendDrinkColors(inGlass);
  const fillPercent = Math.min(18 + inGlass.length * 12, 88);
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
    <div className="mixing-canvas">
      {pantry.map((ing, index) => {
        const pos = SCATTER[index % SCATTER.length];
        const used = inGlassIds.has(ing.id);
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
              animationDelay: `${index * 0.12}s`,
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
                    ? `linear-gradient(180deg, ${blended}ee, ${layerGradient})`
                    : blended === 'transparent'
                      ? 'transparent'
                      : `linear-gradient(180deg, ${blended}cc, ${blended})`,
              }}
            >
              {inGlass.length > 0 && (
                <div className="bubbles" aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <ul className="glass-bits">
              {inGlass.map((ing, index) => (
                <li
                  key={ing.id}
                  className="glass-bit"
                  style={{
                    left: `${18 + ((index * 17) % 58)}%`,
                    bottom: `${12 + ((index * 13) % 50)}%`,
                    animationDelay: `${index * 0.08}s`,
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

        <p className="drop-hint">
          {inGlass.length === 0
            ? 'Drag a picture into the glass'
            : 'Tap a bit in the glass to remove it'}
        </p>
      </div>
    </div>
  );
}
