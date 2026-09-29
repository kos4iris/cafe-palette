"""One-off: split the hand-drawn fruit sheet into transparent PNGs."""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(
    "/Users/irisli/.cursor/projects/Users-irisli-Desktop-sip-lab/assets/"
    "Untitled_Artwork-0d3f3e12-623c-4a3e-9c71-56ea09e5ab58.jpg"
)
OUT = Path("/Users/irisli/Desktop/sip-lab/src/assets/ingredients")

# Black backdrop -> alpha ramp on the brightest channel so dark reds/greens survive.
ALPHA_LO = 16
ALPHA_HI = 44
MIN_AREA = 400  # in downsampled pixels
STEP = 4  # downsample factor for component labeling

# Each sprite is the union of blobs whose centroid lands nearest an anchor.
ANCHORS = {
    "cherry": (0.22, 0.20),
    "mango": (0.78, 0.20),
    "lemon": (0.41, 0.39),
    "strawberry": (0.18, 0.78),
    "orange": (0.75, 0.61),
}


def build_alpha(img: Image.Image) -> Image.Image:
    px = img.load()
    w, h = img.size
    alpha = Image.new("L", (w, h))
    ap = alpha.load()
    span = ALPHA_HI - ALPHA_LO
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            m = r if r > g else g
            if b > m:
                m = b
            if m <= ALPHA_LO:
                ap[x, y] = 0
            elif m >= ALPHA_HI:
                ap[x, y] = 255
            else:
                ap[x, y] = int((m - ALPHA_LO) * 255 / span)
    return alpha


def components(alpha: Image.Image, size: tuple[int, int]):
    """Label blobs on a downsampled mask; return (pixels, centroid) per blob."""
    sw, sh = size
    small = alpha.resize((sw, sh), Image.BILINEAR).load()
    seen = [[False] * sw for _ in range(sh)]
    blobs = []

    for sy in range(sh):
        for sx in range(sw):
            if seen[sy][sx] or small[sx, sy] < 110:
                continue
            q = deque([(sx, sy)])
            seen[sy][sx] = True
            pixels = []
            while q:
                cx, cy = q.popleft()
                pixels.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < sw and 0 <= ny < sh and not seen[ny][nx]:
                            if small[nx, ny] >= 110:
                                seen[ny][nx] = True
                                q.append((nx, ny))
            if len(pixels) >= MIN_AREA:
                cx = sum(p[0] for p in pixels) / len(pixels) / sw
                cy = sum(p[1] for p in pixels) / len(pixels) / sh
                blobs.append((pixels, (cx, cy)))
    return blobs


def nearest_anchor(centroid: tuple[float, float]) -> str:
    cx, cy = centroid
    return min(
        ANCHORS, key=lambda k: (ANCHORS[k][0] - cx) ** 2 + (ANCHORS[k][1] - cy) ** 2
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC).convert("RGB")
    w, h = img.size
    sw, sh = w // STEP, h // STEP

    alpha = build_alpha(img)
    rgba = img.convert("RGBA")

    groups: dict[str, list[tuple[int, int]]] = {}
    for pixels, centroid in components(alpha, (sw, sh)):
        groups.setdefault(nearest_anchor(centroid), []).extend(pixels)

    for name, pixels in groups.items():
        # Isolate this sprite so neighbouring fruit inside the crop box drops out.
        mask_small = Image.new("L", (sw, sh), 0)
        mp = mask_small.load()
        for x, y in pixels:
            mp[x, y] = 255
        mask_small = mask_small.filter(ImageFilter.MaxFilter(5))
        mask = mask_small.resize((w, h), Image.BILINEAR)

        own = Image.new("L", (w, h))
        ap, mp2, op = alpha.load(), mask.load(), own.load()
        for y in range(h):
            for x in range(w):
                op[x, y] = ap[x, y] if mp2[x, y] > 120 else 0

        sprite = rgba.copy()
        sprite.putalpha(own)
        box = own.getbbox()
        pad = 8
        box = (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(w, box[2] + pad),
            min(h, box[3] + pad),
        )
        sprite = sprite.crop(box)
        sprite.thumbnail((440, 440), Image.LANCZOS)
        sprite.save(OUT / f"{name}.png")
        print(f"{name}.png size={sprite.size}")

    for leftover in OUT.glob("raw-*.png"):
        leftover.unlink()


if __name__ == "__main__":
    main()
