const cache = new Map<string, string>();
let prepared: Promise<PreparedGlass> | null = null;

interface PreparedGlass {
  image: ImageData;
  mask: Uint8Array;
  /** Mid lightness of the painted liquid. Shading is kept as a shift around this. */
  medianL: number;
  medianS: number;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [
    clamp255((r + m) * 255),
    clamp255((g + m) * 255),
    clamp255((b + m) * 255),
  ];
}

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return rgbToHsl(
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  );
}

/** Dense painted liquid: clearly red, not the glass or the warm shadow. */
function isLiquidBody(r: number, g: number, b: number): boolean {
  const [h, s] = rgbToHsl(r, g, b);
  const red = h >= 330 || h <= 12;
  return red && s > 0.15 && r > 80 && r - g > 22 && r - b > 18;
}

/** Thin red wash along the surface of the drink, still inside the glass. */
function isLiquidWash(r: number, g: number, b: number): boolean {
  const [h, s, l] = rgbToHsl(r, g, b);
  const red = h >= 325 || h <= 18;
  return red && s > 0.08 && r - g > 8 && r - b > 5 && l > 0.55;
}

/**
 * Very saturated ingredient colors get eased down so the wash stays soft.
 * Already-muted colors (matcha, coffee) stay close to themselves.
 */
function softenSaturation(targetS: number): number {
  if (targetS > 0.6) return 0.6 + (targetS - 0.6) * 0.35;
  return targetS * 0.92;
}

function prepare(src: string) {
  if (!prepared) {
    prepared = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Could not read the glass artwork'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(buildMask(image));
      };
      img.onerror = () => reject(new Error('Could not load the glass artwork'));
      img.src = src;
    });
  }
  return prepared;
}

function buildMask(image: ImageData): PreparedGlass {
  const { data, width, height } = image;
  const body = new Uint8Array(width * height);
  const lightness: number[] = [];
  const saturation: number[] = [];
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      if (!isLiquidBody(r, g, b)) continue;
      body[y * width + x] = 1;
      const [, s, l] = rgbToHsl(r, g, b);
      lightness.push(l);
      saturation.push(s);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const rowSpan = (y: number): [number, number] | null => {
    let left = -1;
    let right = -1;
    const start = y * width;
    for (let x = 0; x < width; x++) {
      if (!body[start + x]) continue;
      if (left < 0) left = x;
      right = x;
    }
    if (right - left < 8) return null;
    return [left, right];
  };

  const mask = new Uint8Array(body);
  const y0 = Math.max(0, minY - 55);
  const y1 = Math.min(height - 1, maxY + 8);
  for (let y = y0; y <= y1; y++) {
    let span = rowSpan(y);
    if (!span) {
      for (let dy = 1; dy <= 28 && !span; dy++) {
        if (y + dy < height) span = rowSpan(y + dy);
        if (!span && y - dy >= 0) span = rowSpan(y - dy);
      }
    }
    if (!span) continue;
    const left = Math.max(0, span[0] - 6);
    const right = Math.min(width - 1, span[1] + 6);
    for (let x = left; x <= right; x++) {
      const i = y * width + x;
      if (mask[i]) continue;
      const o = i * 4;
      if (isLiquidWash(data[o], data[o + 1], data[o + 2])) mask[i] = 1;
    }
  }

  lightness.sort((a, b) => a - b);
  saturation.sort((a, b) => a - b);
  const mid = (values: number[], fallback: number) =>
    values.length ? values[Math.floor(values.length / 2)] : fallback;

  return {
    image,
    mask,
    medianL: mid(lightness, 0.42),
    medianS: mid(saturation, 0.5),
  };
}

/**
 * Replace the liquid's hue and saturation with the ingredient color.
 * Lightness stays a shift around that color, so highlights stay pale and
 * shadows are darker versions of the new hue instead of the original red.
 */
export async function tintedTumbler(src: string, color: string): Promise<string> {
  const key = color.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const { image, mask, medianL, medianS } = await prepare(src);
  const [targetH, targetS, targetL] = hexToHsl(color);
  const softS = softenSaturation(targetS);

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return src;

  const out = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
  const px = out.data;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const o = i * 4;
    const [, s, l] = rgbToHsl(px[o], px[o + 1], px[o + 2]);
    let nextL = targetL + (l - medianL) * 0.95;
    nextL = Math.max(0.22, Math.min(0.93, nextL));

    let nextS: number;
    if (l > 0.84 && s < 0.22) {
      nextL = Math.max(nextL, 0.9);
      nextS = Math.min(0.12, softS * 0.2);
    } else {
      const ratio = Math.max(0.45, Math.min(1.15, s / medianS));
      nextS = Math.min(0.66, softS * ratio);
    }

    const [r, g, b] = hslToRgb(targetH, nextS, nextL);
    px[o] = r;
    px[o + 1] = g;
    px[o + 2] = b;
  }

  ctx.putImageData(out, 0, 0);
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

export function peekTintedTumbler(color: string): string | undefined {
  return cache.get(color.toLowerCase());
}
