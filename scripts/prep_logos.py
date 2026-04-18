#!/usr/bin/env python3
"""Prepare GMP+ logos for the DQ app.

Reads public/originals/gmp-logo-landscape.png and gmp-logo-portrait.png,
inspects whether the near-black pixels are transparent or opaque, and
writes transparent-background versions to:

    public/gmp-logo.png            (landscape, primary - used in header)
    public/gmp-logo-portrait.png   (portrait, used in PDFs and tiles)

Usage:
    python scripts/prep_logos.py
"""
from __future__ import annotations

import pathlib
import sys

try:
    from PIL import Image
except ImportError:
    print("Install Pillow first: pip install Pillow", file=sys.stderr)
    sys.exit(1)

NEAR_BLACK = 24  # RGB channel threshold below which a pixel is "background"
ORIG = pathlib.Path("public/originals")
OUT = pathlib.Path("public")


def inspect(path: pathlib.Path) -> dict[str, object]:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    # Sample the four corners
    corners = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
    corner_alphas = [c[3] for c in corners]
    corner_rgb_max = max(max(c[0], c[1], c[2]) for c in corners)
    return {
        "size": (w, h),
        "corner_alphas": corner_alphas,
        "corner_rgb_max": corner_rgb_max,
    }


def strip_near_black(path_in: pathlib.Path, path_out: pathlib.Path) -> None:
    img = Image.open(path_in).convert("RGBA")
    w, h = img.size
    data = list(img.getdata())
    changed = 0
    new_data: list[tuple[int, int, int, int]] = []
    for r, g, b, a in data:
        if r <= NEAR_BLACK and g <= NEAR_BLACK and b <= NEAR_BLACK:
            new_data.append((r, g, b, 0))
            if a > 0:
                changed += 1
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    path_out.parent.mkdir(parents=True, exist_ok=True)
    img.save(path_out, format="PNG")
    print(f"  wrote {path_out} ({w}x{h}), {changed} pixels made transparent")


def process(name: str, out_name: str) -> None:
    src = ORIG / name
    if not src.exists():
        print(f"  MISSING: {src}")
        return
    info = inspect(src)
    print(f"  {src.name}: size={info['size']}, corner alphas={info['corner_alphas']}, corner rgb max={info['corner_rgb_max']}")
    out = OUT / out_name
    # Always write a cleaned copy; if the source was already transparent,
    # the result is identical. This keeps the pipeline idempotent.
    strip_near_black(src, out)


def main() -> int:
    if not ORIG.exists():
        print(f"No {ORIG} folder", file=sys.stderr)
        return 1
    process("gmp-logo-landscape.png", "gmp-logo.png")
    process("gmp-logo-portrait.png", "gmp-logo-portrait.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
