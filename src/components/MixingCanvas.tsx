import { useEffect, useState } from 'react';
import cherryGlass from '../assets/glass/cherry.png';
import emptyArt from '../assets/glass/empty.png';
import lemonGlass from '../assets/glass/lemon.png';
import mangoGlass from '../assets/glass/mango.png';
import matchaGlass from '../assets/glass/matcha.png';
import orangeGlass from '../assets/glass/orange.png';
import strawberryGlass from '../assets/glass/strawberry.png';
import tumblerArt from '../assets/glass/tumbler.png';
import type { DrinkType, Ingredient } from '../types';
import { peekTintedTumbler, tintedTumbler } from '../utils/liquidTint';

/** Hand-painted fills. Anything else still falls back to a recolor of the red glass. */
const PAINTED: Record<string, string> = {
  cherry: cherryGlass,
  lemon: lemonGlass,
  mango: mangoGlass,
  matcha: matchaGlass,
  orange: orangeGlass,
  strawberry: strawberryGlass,
};

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
  const first = inGlass[0];
  const painted = first ? PAINTED[first.id] : undefined;
  const firstColor = first?.color ?? null;
  const [tint, setTint] = useState<{ color: string; url: string } | null>(null);

  useEffect(() => {
    if (!firstColor || painted) return;
    let cancel = false;
    void tintedTumbler(tumblerArt, firstColor).then((url) => {
      if (!cancel) setTint({ color: firstColor, url });
    });
    return () => {
      cancel = true;
    };
  }, [firstColor, painted]);

  const cached = firstColor ? peekTintedTumbler(firstColor) : undefined;
  const tinted =
    cached ||
    (tint && firstColor && tint.color.toLowerCase() === firstColor.toLowerCase()
      ? tint.url
      : tumblerArt);
  const filledSrc = painted ?? tinted;

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
            src={inGlass.length > 0 ? filledSrc : emptyArt}
            alt=""
          />
        </div>
      </div>
      </div>
    </div>
  );
}
