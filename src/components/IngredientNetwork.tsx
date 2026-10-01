import { useEffect, useMemo, useRef, useState } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import {
  buildIngredientNetwork,
  type IngredientNetworkData,
  type IngredientNetworkNode,
} from '../utils/ingredientNetwork';
import type { SavedRecipe } from '../utils/savedRecipes';

const VIEW_WIDTH = 1100;
const VIEW_HEIGHT = 640;
const DRINK_STAR = starPoints(18, 7.6);

type SimNode = IngredientNetworkNode & SimulationNodeDatum;
type Layout = Record<string, { x: number; y: number }>;

interface Props {
  recipes: SavedRecipe[];
  onSelectDrink: (id: string) => void;
}

export function IngredientNetwork({ recipes, onSelectDrink }: Props) {
  const data = useMemo(() => buildIngredientNetwork(recipes), [recipes]);
  const neighbors = useMemo(() => neighborMap(data), [data]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [size, setSize] = useState({ width: VIEW_WIDTH, height: VIEW_HEIGHT });
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const layout = useMemo(
    () => layoutNetwork(data, size.width, size.height),
    [data, size.height, size.width],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(640, Math.round(entry.contentRect.width));
      const height = Math.max(420, Math.round(entry.contentRect.height));
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!svg || !group) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.6])
      .filter((event) => {
        if (event.type === 'dblclick') return false;
        if (event.button) return false;
        const target = event.target as Element | null;
        if (event.type !== 'wheel' && target?.closest('.network-node')) return false;
        return true;
      })
      .on('zoom', (event) => {
        group.setAttribute('transform', event.transform.toString());
      });

    const selection = select(svg);
    selection.call(behavior);
    selection.call(behavior.transform, fitTransform(layout, size.width, size.height));

    return () => {
      selection.on('.zoom', null);
    };
  }, [layout, size.height, size.width]);

  const focusId = hoveredId ?? selectedId;
  const selected = data.nodes.find((node) => node.id === selectedId && node.type === 'ingredient');

  function tone(id: string): 'idle' | 'hot' | 'dim' {
    if (!focusId) return 'idle';
    if (id === focusId || neighbors.get(focusId)?.has(id)) return 'hot';
    return 'dim';
  }

  const ordered = [...data.nodes].sort((a, b) => rank(tone(a.id)) - rank(tone(b.id)));

  return (
    <div className="network-frame" ref={frameRef}>
      <svg
        ref={svgRef}
        className="network-svg"
        viewBox={`0 0 ${size.width} ${size.height}`}
        role="group"
        aria-label="Ingredient network"
        onClick={(event) => {
          const target = event.target as Element;
          if (!target.closest('.network-node')) setSelectedId(null);
        }}
      >
        <rect className="network-canvas" width={size.width} height={size.height} />
        <g ref={groupRef}>
          {data.edges.map((edge) => {
            const source = layout[edge.source];
            const target = layout[edge.target];
            if (!source || !target) return null;
            const edgeTone =
              tone(edge.source) === 'dim' || tone(edge.target) === 'dim' ? 'dim' : tone(edge.source);
            return (
              <line
                key={edge.id}
                className={edgeTone === 'idle' ? 'network-edge' : `network-edge is-${edgeTone}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
            );
          })}
          {ordered.map((node) => {
            const point = layout[node.id];
            if (!point) return null;
            const nodeTone = tone(node.id);
            const lines = labelLines(node.label);
            const show = visibleLabel(node, nodeTone, data.nodes.length);
            const markRadius = node.type === 'drink' ? 18 : 8;
            return (
              <g
                key={node.id}
                className={nodeTone === 'idle' ? 'network-node' : `network-node is-${nodeTone}`}
                transform={`translate(${point.x} ${point.y})`}
                role="button"
                tabIndex={0}
                aria-label={nodeAria(node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId((current) => (current === node.id ? null : current))}
                onClick={(event) => {
                  event.stopPropagation();
                  if (node.type === 'drink' && node.recipeId) onSelectDrink(node.recipeId);
                  else setSelectedId((current) => (current === node.id ? null : node.id));
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  if (node.type === 'drink' && node.recipeId) onSelectDrink(node.recipeId);
                  else setSelectedId((current) => (current === node.id ? null : node.id));
                }}
              >
                <circle className="network-hit" r={node.type === 'drink' ? 28 : 18} />
                {node.type === 'drink' ? (
                  <polygon
                    className="network-drink"
                    points={DRINK_STAR}
                    transform={`rotate(${drinkTurn(node.recipeId ?? node.id)})`}
                  />
                ) : (
                  <circle className="network-ingredient" r={8} />
                )}
                {show &&
                  lines.map((line, index) => (
                    <text
                      key={line}
                      className={
                        node.type === 'drink'
                          ? 'network-label network-label-drink'
                          : 'network-label network-label-ingredient'
                      }
                      y={markRadius + 16 + index * 15}
                    >
                      {line}
                    </text>
                  ))}
              </g>
            );
          })}
        </g>
      </svg>

      <p className="network-legend">
        <span>
          <svg className="network-legend-star" viewBox="-20 -20 40 40" aria-hidden="true">
            <polygon points={DRINK_STAR} />
          </svg>
          Drink
        </span>
        <span>
          <i className="is-ingredient" />
          Ingredient
        </span>
      </p>
      <p className="network-hint">Drag to pan · scroll to zoom</p>

      {selected && (
        <aside className="network-panel" aria-label={selected.label}>
          <h3>{selected.label}</h3>
          <p className="network-panel-count">
            {selected.drinks.length} saved {selected.drinks.length === 1 ? 'drink' : 'drinks'}
          </p>
          <ul>
            {selected.drinks.map((drink) => (
              <li key={drink.id}>
                <button type="button" onClick={() => onSelectDrink(drink.id)}>
                  {drink.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

function layoutNetwork(data: IngredientNetworkData, width: number, height: number): Layout {
  const simNodes: SimNode[] = data.nodes.map((node, index) => {
    const angle = (index / Math.max(data.nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const reach = node.type === 'drink' ? 0.32 : 0.44;
    return {
      ...node,
      x: width / 2 + Math.cos(angle) * width * reach,
      y: height / 2 + Math.sin(angle) * height * reach,
    };
  });
  const links: SimulationLinkDatum<SimNode>[] = data.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));

  const simulation = forceSimulation(simNodes)
    .force(
      'link',
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
        .id((node) => node.id)
        .distance(Math.min(width, height) * 0.28)
        .strength(0.35),
    )
    .force(
      'charge',
      forceManyBody<SimNode>().strength((node) => (node.type === 'drink' ? -700 : -280)),
    )
    .force('center', forceCenter(width / 2, height / 2))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) => (node.type === 'drink' ? 86 : 42))
        .iterations(2),
    )
    .force('x', forceX(width / 2).strength(0.018))
    .force('y', forceY(height / 2).strength(0.05))
    .stop();

  const ticks = Math.min(360, 100 + data.nodes.length * 10);
  for (let step = 0; step < ticks; step += 1) simulation.tick();

  const layout: Layout = {};
  for (const node of simNodes) {
    layout[node.id] = {
      x: node.x ?? width / 2,
      y: node.y ?? height / 2,
    };
  }
  return layout;
}

function neighborMap(data: IngredientNetworkData): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const node of data.nodes) map.set(node.id, new Set());
  for (const edge of data.edges) {
    map.get(edge.source)?.add(edge.target);
    map.get(edge.target)?.add(edge.source);
  }
  return map;
}

function fitTransform(layout: Layout, width: number, height: number) {
  const points = Object.values(layout);
  if (points.length === 0) return zoomIdentity;
  const minX = Math.min(...points.map((point) => point.x)) - 110;
  const maxX = Math.max(...points.map((point) => point.x)) + 110;
  const minY = Math.min(...points.map((point) => point.y)) - 40;
  const maxY = Math.max(...points.map((point) => point.y)) + 78;
  const scale = Math.max(
    0.5,
    Math.min(1.85, 0.92 / Math.max((maxX - minX) / width, (maxY - minY) / height)),
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-cx, -cy);
}

function rank(tone: 'idle' | 'hot' | 'dim'): number {
  return tone === 'hot' ? 1 : 0;
}

function visibleLabel(
  node: IngredientNetworkNode,
  tone: 'idle' | 'hot' | 'dim',
  nodeCount: number,
): boolean {
  if (node.type === 'drink') return true;
  if (tone === 'hot') return true;
  if (tone === 'dim') return false;
  if (node.drinks.length > 1) return true;
  return nodeCount <= 18;
}

function labelLines(label: string): string[] {
  if (label.length <= 22) return [label];
  const lines: string[] = [];
  let current = '';
  for (const word of label.split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > 22) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function nodeAria(node: IngredientNetworkNode): string {
  if (node.type === 'drink') return `${node.label}. Open recipe.`;
  const count = node.drinks.length;
  return `${node.label}. Used in ${count} saved ${count === 1 ? 'drink' : 'drinks'}.`;
}

function starPoints(outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
}

function drinkTurn(id: string): number {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) {
    value = (value * 33 + id.charCodeAt(index)) >>> 0;
  }
  return value % 360;
}
