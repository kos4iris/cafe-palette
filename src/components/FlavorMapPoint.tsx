interface Props {
  cx: number;
  cy: number;
  active: boolean;
  clustered: boolean;
  label: string;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}

export function FlavorMapPoint({
  cx,
  cy,
  active,
  clustered,
  label,
  onSelect,
  onHover,
}: Props) {
  return (
    <g
      className={active ? 'flavor-point is-active' : 'flavor-point'}
      style={{ opacity: clustered ? 0.78 : 0.94 }}
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
      <circle className="flavor-point-hit" cx={cx} cy={cy} r="14" />
      <circle
        className="flavor-dot-wash"
        cx={cx}
        cy={cy}
        r={active ? 12 : 9}
        filter="url(#flavor-marker-wash)"
      />
      <circle cx={cx} cy={cy} r={active ? 20 : 16} fill="url(#flavor-marker-halo)" />
      <circle className="flavor-dot-ring" cx={cx} cy={cy} r={active ? 6.4 : 5.2} />
      <circle className="flavor-dot" cx={cx} cy={cy} r={active ? 3.2 : 2.6} />
    </g>
  );
}
