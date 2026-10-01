import { useMemo, useState } from 'react';
import wash from '../assets/flavor-bg.jpg';
import type { FlavorProfile } from '../services/drinkApi';
import { calculateFlavorPosition } from '../utils/calculateFlavorPosition';
import { scoreOutOfTen } from '../utils/flavorProfile';
import { FlavorMapPoint } from './FlavorMapPoint';

const PLOT_LEFT = 54;
const PLOT_TOP = 26;
const PLOT_SIZE = 268;
const PLOT_RIGHT = PLOT_LEFT + PLOT_SIZE;
const PLOT_BOTTOM = PLOT_TOP + PLOT_SIZE;
const CENTER_X = PLOT_LEFT + PLOT_SIZE / 2;
const CENTER_Y = PLOT_TOP + PLOT_SIZE / 2;
const VIEW_WIDTH = 376;
const VIEW_HEIGHT = 324;
const DIVISIONS = 20;
const CLUSTER_DISTANCE = 14;

export type FlavorPlotRecipe = {
  id: string;
  name: string;
  profile: FlavorProfile;
};

type PlottedDrink = FlavorPlotRecipe & {
  scores: { sweet: number; tart: number; light: number; rich: number };
  cx: number;
  cy: number;
  displayCx: number;
  displayCy: number;
  clusterId: string;
};

export function FlavorMap({
  recipes,
  onSelect,
}: {
  recipes: FlavorPlotRecipe[];
  onSelect: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const plotted = useMemo(() => plotRecipes(recipes), [recipes]);
  const hovered = plotted.find((drink) => drink.id === hoveredId) ?? null;
  const ordered = [...plotted].sort((a, b) => {
    const aHot = a.id === hoveredId ? 1 : 0;
    const bHot = b.id === hoveredId ? 1 : 0;
    return aHot - bHot;
  });
  const tooltipBelow = hovered ? hovered.displayCy < PLOT_TOP + PLOT_SIZE * 0.22 : false;

  return (
    <div className="flavor-map">
      <div className="flavor-chart-frame">
      <svg
        className="flavor-chart"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label={`Flavor map of ${plotted.length} saved ${plotted.length === 1 ? 'drink' : 'drinks'}`}
      >
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
        <rect className="flavor-frame" x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_SIZE} height={PLOT_SIZE} />
        <polygon
          className="flavor-arrow"
          points={`${PLOT_RIGHT},${CENTER_Y} ${PLOT_RIGHT - 4.5},${CENTER_Y - 1.8} ${PLOT_RIGHT - 4.5},${CENTER_Y + 1.8}`}
        />
        <polygon
          className="flavor-arrow"
          points={`${PLOT_LEFT},${CENTER_Y} ${PLOT_LEFT + 4.5},${CENTER_Y - 1.8} ${PLOT_LEFT + 4.5},${CENTER_Y + 1.8}`}
        />
        <polygon
          className="flavor-arrow"
          points={`${CENTER_X},${PLOT_TOP} ${CENTER_X - 1.8},${PLOT_TOP + 4.5} ${CENTER_X + 1.8},${PLOT_TOP + 4.5}`}
        />
        <polygon
          className="flavor-arrow"
          points={`${CENTER_X},${PLOT_BOTTOM} ${CENTER_X - 1.8},${PLOT_BOTTOM - 4.5} ${CENTER_X + 1.8},${PLOT_BOTTOM - 4.5}`}
        />
        <text className="flavor-label" x={CENTER_X} y="16" textAnchor="middle">
          RICH
        </text>
        <text className="flavor-label" x={CENTER_X} y="312" textAnchor="middle">
          LIGHT
        </text>
        <text className="flavor-label" x="44" y={CENTER_Y + 4} textAnchor="end">
          SWEET
        </text>
        <text className="flavor-label" x="330" y={CENTER_Y + 4} textAnchor="start">
          TART
        </text>
        {ordered.map((drink) => (
          <FlavorMapPoint
            key={drink.id}
            cx={drink.displayCx}
            cy={drink.displayCy}
            active={drink.id === hoveredId}
            clustered={plotted.filter((item) => item.clusterId === drink.clusterId).length > 1}
            label={pointLabel(drink)}
            seed={drink.id}
            onSelect={() => onSelect(drink.id)}
            onHover={(hovering) => setHoveredId(hovering ? drink.id : null)}
          />
        ))}
      </svg>
      {hovered && (
        <div
          className={tooltipBelow ? 'flavor-tooltip is-below' : 'flavor-tooltip'}
          style={{
            left: `${(hovered.displayCx / VIEW_WIDTH) * 100}%`,
            top: `${(hovered.displayCy / VIEW_HEIGHT) * 100}%`,
          }}
          role="tooltip"
        >
          <div className="flavor-tooltip-drink">
            <p className="flavor-tooltip-name">{hovered.name}</p>
            <ul>
              <li>Sweet: {hovered.scores.sweet}</li>
              <li>Tart: {hovered.scores.tart}</li>
              <li>Light: {hovered.scores.light}</li>
              <li>Rich: {hovered.scores.rich}</li>
            </ul>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function pointLabel(drink: PlottedDrink): string {
  const { sweet, tart, light, rich } = drink.scores;
  return `${drink.name}. Sweet ${sweet} out of 10, tart ${tart} out of 10, light ${light} out of 10, rich ${rich} out of 10.`;
}

function plotRecipes(recipes: FlavorPlotRecipe[]): PlottedDrink[] {
  const placed = recipes.map((recipe) => {
    const position = calculateFlavorPosition(recipe.profile);
    const dot = plotDot(position.x, position.y);
    return {
      ...recipe,
      scores: {
        sweet: scoreOutOfTen(recipe.profile.sweet),
        tart: scoreOutOfTen(recipe.profile.tart),
        light: scoreOutOfTen(recipe.profile.light),
        rich: scoreOutOfTen(recipe.profile.rich),
      },
      cx: dot.cx,
      cy: dot.cy,
      displayCx: dot.cx,
      displayCy: dot.cy,
      clusterId: recipe.id,
    };
  });

  const groups = new Map<number, PlottedDrink[]>();
  const parent = placed.map((_, index) => index);
  const find = (index: number): number => {
    if (parent[index] !== index) parent[index] = find(parent[index]);
    return parent[index];
  };
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      if (distance(placed[i], placed[j]) > CLUSTER_DISTANCE) continue;
      const left = find(i);
      const right = find(j);
      if (left !== right) parent[left] = right;
    }
  }
  placed.forEach((drink, index) => {
    const root = find(index);
    const group = groups.get(root) ?? [];
    group.push(drink);
    groups.set(root, group);
  });

  for (const group of groups.values()) {
    const clusterId = group[0].id;
    group.forEach((drink, index) => {
      const offset = spread(group.length, index);
      drink.clusterId = clusterId;
      drink.displayCx = clampPlot(drink.cx + offset.dx, PLOT_LEFT, PLOT_RIGHT);
      drink.displayCy = clampPlot(drink.cy + offset.dy, PLOT_TOP, PLOT_BOTTOM);
    });
  }

  return placed;
}

function distance(a: { cx: number; cy: number }, b: { cx: number; cy: number }): number {
  return Math.hypot(a.cx - b.cx, a.cy - b.cy);
}

function clampPlot(value: number, start: number, end: number): number {
  return Math.max(start + 8, Math.min(end - 8, value));
}

/** Visual-only nudge. The stored flavor coordinates stay put. */
function spread(count: number, index: number): { dx: number; dy: number } {
  if (count <= 1) return { dx: 0, dy: 0 };
  const radius = Math.min(16, 6 + count * 1.5);
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

/** Twenty cells each way. Even marks match the quieter tens; the center is the axis. */
function gridMarks(): { at: number; vertical: boolean; major: boolean }[] {
  const marks: { at: number; vertical: boolean; major: boolean }[] = [];
  for (let step = 1; step < DIVISIONS; step += 1) {
    if (step === DIVISIONS / 2) continue;
    const major = step % 2 === 0;
    const at = (PLOT_SIZE / DIVISIONS) * step;
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
