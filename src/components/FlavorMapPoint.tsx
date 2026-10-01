interface Props {
  cx: number;
  cy: number;
  active: boolean;
  clustered: boolean;
  label: string;
  seed: string;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}

const STAR = starPoints(4.92, 2.1);
const STAR_COLOR = '#506186';

export function FlavorMapPoint({
  cx,
  cy,
  active,
  clustered,
  label,
  seed,
  onSelect,
  onHover,
}: Props) {
  const turn = hash(seed) % 360;
  const scale = active ? 1.22 : 1;

  return (
    <g
      className={active ? 'flavor-point is-active' : 'flavor-point'}
      style={{ opacity: clustered ? 0.82 : 1 }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <circle className="flavor-point-hit" cx={cx} cy={cy} r="12" />
      <polygon
        className="flavor-star"
        points={STAR}
        fill={STAR_COLOR}
        transform={`translate(${cx} ${cy}) rotate(${turn}) scale(${scale})`}
      />
    </g>
  );
}

/** Five-point star centered on the origin. */
function starPoints(outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
}

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 33 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
}
