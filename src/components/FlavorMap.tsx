import wash from '../assets/flavor-bg.jpg';
import type { FlavorProfile } from '../services/drinkApi';
import { flavorPoint } from '../utils/flavorProfile';

const PLOT_LEFT = 54;
const PLOT_TOP = 26;
const PLOT_SIZE = 268;
const PLOT_RIGHT = PLOT_LEFT + PLOT_SIZE;
const PLOT_BOTTOM = PLOT_TOP + PLOT_SIZE;
const CENTER_X = PLOT_LEFT + PLOT_SIZE / 2;
const CENTER_Y = PLOT_TOP + PLOT_SIZE / 2;

export function FlavorMap({ profile }: { profile: FlavorProfile }) {
  const point = flavorPoint(profile);
  const dot = plotDot(point.x, point.y);

  return (
    <section className="flavor-map" aria-label={mapLabel(point.x, point.y)}>
      <h3>Flavor Map</h3>
      <svg className="flavor-chart" viewBox="0 0 376 324" role="img">
        <defs>
          <radialGradient id="flavor-marker-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8eafcc" stopOpacity="0.42" />
            <stop offset="48%" stopColor="#c5d7e6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#adc7d9" stopOpacity="0" />
          </radialGradient>
          <filter id="flavor-marker-wash" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <clipPath id="flavor-plot">
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_SIZE} height={PLOT_SIZE} />
          </clipPath>
        </defs>
        <rect className="flavor-field" x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_SIZE} height={PLOT_SIZE} />
        <image
          className="flavor-wash"
          href={wash}
          x={PLOT_LEFT}
          y={PLOT_TOP}
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#flavor-plot)"
        />
        {gridMarks().map((mark) =>
          mark.vertical ? (
            <line
              key={`v-${mark.at}`}
              className={mark.major ? 'flavor-grid flavor-grid-major' : 'flavor-grid'}
              x1={mark.at}
              y1={PLOT_TOP}
              x2={mark.at}
              y2={PLOT_BOTTOM}
            />
          ) : (
            <line
              key={`h-${mark.at}`}
              className={mark.major ? 'flavor-grid flavor-grid-major' : 'flavor-grid'}
              x1={PLOT_LEFT}
              y1={mark.at}
              x2={PLOT_RIGHT}
              y2={mark.at}
            />
          ),
        )}
        <line className="flavor-axis" x1={PLOT_LEFT} y1={CENTER_Y} x2={PLOT_RIGHT} y2={CENTER_Y} />
        <line className="flavor-axis" x1={CENTER_X} y1={PLOT_TOP} x2={CENTER_X} y2={PLOT_BOTTOM} />
        <polygon className="flavor-arrow" points={`${PLOT_RIGHT},${CENTER_Y} ${PLOT_RIGHT - 4.5},${CENTER_Y - 1.8} ${PLOT_RIGHT - 4.5},${CENTER_Y + 1.8}`} />
        <polygon className="flavor-arrow" points={`${PLOT_LEFT},${CENTER_Y} ${PLOT_LEFT + 4.5},${CENTER_Y - 1.8} ${PLOT_LEFT + 4.5},${CENTER_Y + 1.8}`} />
        <polygon className="flavor-arrow" points={`${CENTER_X},${PLOT_TOP} ${CENTER_X - 1.8},${PLOT_TOP + 4.5} ${CENTER_X + 1.8},${PLOT_TOP + 4.5}`} />
        <polygon className="flavor-arrow" points={`${CENTER_X},${PLOT_BOTTOM} ${CENTER_X - 1.8},${PLOT_BOTTOM - 4.5} ${CENTER_X + 1.8},${PLOT_BOTTOM - 4.5}`} />
        <circle className="flavor-dot-wash" cx={dot.cx} cy={dot.cy} r="9" filter="url(#flavor-marker-wash)" />
        <circle cx={dot.cx} cy={dot.cy} r="16" fill="url(#flavor-marker-halo)" />
        <circle className="flavor-dot-ring" cx={dot.cx} cy={dot.cy} r="5.2" />
        <circle className="flavor-dot" cx={dot.cx} cy={dot.cy} r="2.6" />
        <text className="flavor-label" x={CENTER_X} y="16" textAnchor="middle">
          RICH
        </text>
        <text className="flavor-label" x={CENTER_X} y="312" textAnchor="middle">
          LIGHT
        </text>
        <text className="flavor-label" x="52" y={CENTER_Y + 4} textAnchor="end">
          SWEET
        </text>
        <text className="flavor-label" x="330" y={CENTER_Y + 4} textAnchor="start">
          TART
        </text>
      </svg>
    </section>
  );
}

/** Ten cells each way. Even marks are slightly stronger; the center is the axis. */
function gridMarks(): { at: number; vertical: boolean; major: boolean }[] {
  const divisions = 10;
  const marks: { at: number; vertical: boolean; major: boolean }[] = [];
  for (let step = 1; step < divisions; step += 1) {
    if (step === divisions / 2) continue;
    const major = step % 2 === 0;
    const at = (PLOT_SIZE / divisions) * step;
    marks.push({ at: PLOT_LEFT + at, vertical: true, major });
    marks.push({ at: PLOT_TOP + at, vertical: false, major });
  }
  return marks;
}

function plotDot(x: number, y: number): { cx: number; cy: number } {
  return {
    cx: PLOT_LEFT + ((x + 10) / 20) * PLOT_SIZE,
    cy: PLOT_TOP + ((10 - y) / 20) * PLOT_SIZE,
  };
}

function mapLabel(x: number, y: number): string {
  return `Flavor map. This drink sits ${horizontal(x)} and ${vertical(y)}.`;
}

function horizontal(x: number): string {
  if (x <= -1.5) return 'toward sweet';
  if (x >= 1.5) return 'toward tart';
  return 'near the center between sweet and tart';
}

function vertical(y: number): string {
  if (y >= 1.5) return 'toward rich';
  if (y <= -1.5) return 'toward light';
  return 'near the center between rich and light';
}
