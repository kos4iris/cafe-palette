import emptyArt from '../assets/glass/empty.png';
import tumblerArt from '../assets/glass/tumbler.png';
import type { DrinkType, Ingredient } from '../types';

/** Positions inside the centered cluster. Long side is about 120px. */
const PLACES: Record<string, { top: string; left: string; width: string }> = {
  cherry: { top: '86px', left: '0px', width: '117px' },
  orange: { top: '0px', left: '211px', width: '120px' },
  mango: { top: '90px', left: '406px', width: '120px' },
  strawberry: { top: '300px', left: '10px', width: '98px' },
  lemon: { top: '300px', left: '422px', width: '120px' },
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
      <div className="cluster">
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
          <img
            className="glass-layer"
            src={inGlass.length > 0 ? tumblerArt : emptyArt}
            alt=""
          />
        </div>
      </div>
      </div>
    </div>
  );
}
