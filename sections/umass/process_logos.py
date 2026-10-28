"""Turn Cole's club logos (img/umass/raw/) into webp marks that sit cleanly on black (img/umass/).

Run from the repo root:  python sections/umass/process_logos.py
Pure Pillow, no numpy. The raw files are never modified.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

RAW = Path("img/umass/raw")
OUT = Path("img/umass")


def smooth(lo, hi):
    """Point table: 0 below lo, 255 above hi, smoothstep between (clean anti-aliased edges)."""
    def f(v):
        t = min(max((v - lo) / (hi - lo), 0), 1)
        return round(255 * t * t * (3 - 2 * t))
    return f


def white_mark(alpha):
    """A pure white image that uses `alpha` as its alpha channel."""
    im = Image.new("RGBA", alpha.size, (255, 255, 255, 255))
    im.putalpha(alpha)
    return im


def trim(im, pad=0.04):
    box = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(box)
    p = round(max(im.size) * pad)
    out = Image.new("RGBA", (im.width + 2 * p, im.height + 2 * p), (0, 0, 0, 0))
    out.paste(im, (p, p))
    return out


def fit(im, max_w, max_h):
    """Scale to fit the box (2x of the CSS box). Upscales small sources too, for crisper edges."""
    s = min(max_w / im.width, max_h / im.height)
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


def save(im, name, q=86):
    path = OUT / f"{name}.webp"
    im.save(path, "WEBP", quality=q, alpha_quality=90, method=6)
    print(f"{path}  {im.size[0]}x{im.size[1]}  {path.stat().st_size / 1024:.1f} KB")


def light_on_dark(src, lo, hi):
    """White or grey logo on a dark (possibly gradient) background: luminance becomes alpha."""
    lum = Image.open(RAW / src).convert("L")
    return trim(white_mark(lum.point(smooth(lo, hi))))


def aim():
    """A.I.M. is tiny (197px of ink). Upscale the alpha 4x, then re-sharpen its edge with a curve."""
    a = Image.open(RAW / "15.png").convert("RGBA").getchannel("A")
    a = a.resize((a.width * 4, a.height * 4), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.6))
    return trim(white_mark(a.point(smooth(110, 160))))


def riverhawk():
    """Watermark: the black ink of the mascot becomes white on transparent; CSS fades it to about 6%."""
    lum = Image.open(RAW / "14.png").convert("L")
    return trim(white_mark(ImageChops.invert(lum).point(smooth(40, 200))), pad=0.02)


def accounting():
    """Already transparent with white text and gold column: just trim."""
    return trim(Image.open(RAW / "18.png").convert("RGBA"))


def umlfs():
    """White background, blue UML, navy FS, navy bar. Knock out the outer white (flood fill from the
    border so the bar's white type survives), unmix the anti-aliased edge against white, and turn the
    navy FS white so it reads on black. The navy bar stays and gets a faint lift so its edge shows."""
    im = Image.open(RAW / "21.png").convert("RGB")
    w, h = im.size
    px = im.load()

    # Background = near-white pixels connected to the border
    near_white = lambda c: min(c) > 200
    bg = [[False] * w for _ in range(h)]
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if 0 <= x < w and 0 <= y < h and not bg[y][x] and near_white(px[x, y]):
            bg[y][x] = True
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]

    # The bar: the widest run of dark rows
    def dark(c):
        return max(c) < 70
    bar_rows = [y for y in range(h) if sum(dark(px[x, y]) for x in range(w)) > w * 0.6]
    bar_top, bar_bot = min(bar_rows), max(bar_rows)

    out = Image.new("RGBA", (w, h))
    o = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if bg[y][x]:
                o[x, y] = (0, 0, 0, 0)
                continue
            touches_bg = any(0 <= x + dx < w and 0 <= y + dy < h and bg[y + dy][x + dx]
                             for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if touches_bg:
                # color-to-alpha against white
                a = max(255 - r, 255 - g, 255 - b) / 255
                if a < 0.02:
                    o[x, y] = (0, 0, 0, 0)
                    continue
                r, g, b = (round(min(max((c - (1 - a) * 255) / a, 0), 255)) for c in (r, g, b))
            else:
                a = 1
            in_bar = bar_top - 1 <= y <= bar_bot + 1
            if not in_bar and b < 110 and r < 110:   # navy FS (blue UML has b > 150)
                r = g = b = 242
            elif in_bar and dark((r, g, b)):
                r, g, b = r + 14, g + 18, b + 26     # lift the navy bar off pure black
            o[x, y] = (r, g, b, round(a * 255))
    return trim(out)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    save(riverhawk(), "riverhawk-watermark", q=80)
    save(fit(aim(), 760, 300), "aim")
    save(fit(light_on_dark("17.jpg", 150, 235), 360, 200), "ccr")
    save(fit(light_on_dark("16.png", 70, 200), 300, 300), "seniors")
    save(fit(light_on_dark("20.png", 48, 150), 400, 300), "sales-team")
    save(fit(accounting(), 480, 200), "accounting-society")
    save(fit(umlfs(), 480, 200), "umlfs")
