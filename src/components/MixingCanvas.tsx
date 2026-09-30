import tumblerArt from '../assets/glass/tumbler.png';
import type { DrinkType, Ingredient } from '../types';

/** Pixel positions around the cup at (120, 350). Long side is about 150px. */
const PLACES: Record<string, { top: string; left: string; width: string }> = {
  cherry: { top: '300px', left: '50px', width: '147px' },
  orange: { top: '228px', left: '223px', width: '150px' },
  mango: { top: '290px', left: '410px', width: '150px' },
  strawberry: { top: '560px', left: '58px', width: '122px' },
  lemon: { top: '560px', left: '420px', width: '150px' },
};

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
  onAdd,
  setDragOver,
}: Props) {
  const inGlassIds = new Set(inGlass.map((i) => i.id));

  return (
    <div className="mixing-canvas">
      {pantry.map((ing) => {
        const pos = PLACES[ing.id];
        if (!pos || !ing.art) return null;
        const used = inGlassIds.has(ing.id);
        return (
          <button
            key={ing.id}
            type="button"
            className={['float-pic', used ? 'used' : ''].filter(Boolean).join(' ')}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
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
            <img className="float-art" src={ing.art} alt="" draggable={false} />
          </button>
        );
      })}

      <div
        className="glass-dropzone"
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
          <img className="glass-layer" src={tumblerArt} alt="" />
        </div>
      </div>
    </div>
  );
}
