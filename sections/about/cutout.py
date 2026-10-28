"""Cut Cole out of a photo for the About section.

Removes the background, trims to the person, and writes two transparent webp files
into the slot the About section already points at:

    img/about/cole-suit-cutout.webp      1200px tall, for desktop (2x)
    img/about/cole-suit-cutout-sm.webp    700px tall, for phones

Usage (from anywhere):
    python sections/about/cutout.py path/to/photo.jpg
    python sections/about/cutout.py photo.jpg --keep 0.62     # full-length shot: keep head to mid-thigh
    python sections/about/cutout.py photo.jpg --matting       # cleaner hair edges, slower

Needs rembg (background removal) and Pillow. This script does not install anything.
"""

import argparse
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SLOT = REPO / "img" / "about" / "cole-suit-cutout.webp"
SLOT_SM = REPO / "img" / "about" / "cole-suit-cutout-sm.webp"
HEIGHT, HEIGHT_SM = 1200, 700


def need(module, how):
    try:
        return __import__(module)
    except ImportError:
        print(f"{module} is not installed. Install it with:\n\n    {how}\n", file=sys.stderr)
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser(description="Cut Cole out of a photo for the About section.")
    ap.add_argument("photo", type=Path, help="the source photo (jpg, png, webp, heic if Pillow can read it)")
    ap.add_argument("--keep", type=float, default=1.0,
                    help="fraction of the person's height to keep, from the top of the head (default 1.0). "
                         "The section fades the bottom out, so 0.55 to 0.7 suits a full-length photo.")
    ap.add_argument("--matting", action="store_true", help="use alpha matting for softer, cleaner edges")
    ap.add_argument("--model", default="isnet-general-use",
                    help="rembg model (default isnet-general-use; u2net_human_seg also works well for people)")
    args = ap.parse_args()

    if not args.photo.is_file():
        sys.exit(f"Not found: {args.photo}")
    if not 0.2 <= args.keep <= 1.0:
        sys.exit("--keep must be between 0.2 and 1.0")

    need("PIL", 'pip install pillow')
    rembg = need("rembg", 'pip install "rembg[cpu]"    (or "rembg[gpu]" with a CUDA card)')
    from PIL import Image, ImageOps

    src = ImageOps.exif_transpose(Image.open(args.photo)).convert("RGB")
    print(f"Removing background from {args.photo.name} ({src.width}x{src.height}) with {args.model} ...")
    session = rembg.new_session(args.model)
    cut = rembg.remove(src, session=session, alpha_matting=args.matting, post_process_mask=True).convert("RGBA")

    # Trim to the person: ignore faint alpha noise when finding the box
    box = cut.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    if not box:
        sys.exit("No person found in the photo (the mask came back empty).")
    left, top, right, bottom = box
    bottom = top + round((bottom - top) * args.keep)
    cut = cut.crop((left, top, right, bottom))

    SLOT.parent.mkdir(parents=True, exist_ok=True)
    for path, h in ((SLOT, HEIGHT), (SLOT_SM, HEIGHT_SM)):
        out = cut
        if cut.height > h:
            out = cut.resize((round(cut.width * h / cut.height), h), Image.LANCZOS)
        elif cut.height < h:
            print(f"Note: the cutout is only {cut.height}px tall; {path.name} wants {h}px for sharp 2x screens.")
        out.save(path, "WEBP", quality=88, method=6, exact=False)
        print(f"Wrote {path.relative_to(REPO)}  {out.width}x{out.height}  {path.stat().st_size // 1024} KB")

    print("Done. Reload the About section: the placeholder silhouette swaps for the photo on its own.")


if __name__ == "__main__":
    main()
