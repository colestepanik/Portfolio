# Portfolio rework: design brief and section contract

Owner: Cole Stepanik. Started Oct 28, 2026. The main session integrates; section sessions build one module each.

## Direction
Rework the look of colestepanik.com after holygrid.studio (a Framer studio site by Marc Kuiper). Take the feel, never the assets: no copied images, 3D models, copy or code from that site or its templates. Everything we ship is ours.

What Cole likes, in his words:
1. Hero background: the red and blue glow from his first reference, made into a color wheel that slowly rotates through all colors and fades down into black.
2. The way sections fade into black.
3. Hovering an image shows a different image.
4. The rotating portfolio part.
5. Lots of images.
6. The phone moving through the page on scroll. Use it for Ownerhound.
7. The About image: huge "About" word with the person standing in front of it, cut out. Ours is Cole in a suit (photo pending from Cole).
8. The chrome star at the bottom with the moving reflective texture.

## Page order (final)
1. Hero: Cole's face first, name, one line, two buttons, over the rotating color wheel.
2. Ownerhound flagship: phone scroll story, links to https://ownerhound.com.
3. Skills and side projects: 2nd Brain first (links to `brain.html`), READ Market Engine, SIE Prep App, CCR pipeline, AIM tools. Hover-swap images and the rotating portfolio live here.
4. About: big word with Cole cut out in front.
5. Resume timeline (exists, restyled later by the main session).
6. Contact and footer with the chrome star.

## Look
- Base: black. Page `#0a0a0b`, surfaces `#141416`, lines `rgb(255 255 255 / .08)`. Text `#f2f2f3`, secondary `#a1a1a8`, muted `#6e6e76`.
- Type: light sans for most text, italic serif for the emphasis line. Pairing like the reference: "Where Color Meet" in a thin sans, "Powerful Concepts" in a big italic serif.
  - Sans: `var(--sans)` (DM Sans, local `fonts/dm-sans.woff2`), weights 300 to 500.
  - Serif: `var(--serif)` = "Instrument Serif", loaded with `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">`.
  - Mono: `var(--mono)` for small labels.
- Shapes: big surfaces 20px radius, nested 14px, clickables are pills. Buttons: white solid, and dark glass.
- Motion: slow and eased, `var(--ease)` = `cubic-bezier(.16, 1, .3, 1)`. Prefer CSS scroll-driven animations with an IntersectionObserver fallback. Everything must have a still, readable state under `prefers-reduced-motion: reduce`.
- Every section ends by fading into black, so sections blend with no hard edges.
- Phone width: works at 375px, 16px side gutter, no horizontal scroll.

## Section contract (how parallel sessions avoid collisions)
Each section session works ONLY inside its own folder and image folder, and touches nothing else:
- `sections/<name>/section.html`: the markup fragment only (no `<html>`, `<head>` or `<body>`), one root `<section>` with an id.
- `sections/<name>/section.css`: every selector prefixed with the section's class prefix, so nothing leaks.
- `sections/<name>/section.js`: one IIFE, no globals, runs on DOMContentLoaded, does nothing if its root is missing. No frameworks. A library only if truly needed, from cdnjs or jsdelivr with an exact version.
- `sections/<name>/demo.html`: a standalone page that loads `../../site.css`, the serif font link, its own css and js, and pastes the fragment in, so it can be previewed alone.
- `sections/<name>/NOTES.md`: what it does, the files, how to integrate, open asks for Cole.
- Images: `img/<name>/` only. webp, sized for 2x, with a small version for phones where it matters.

Never edit `index.html`, `brain.html`, `site.css`, `design/DESIGN.md`, `.claude/launch.json`, or another section's folder. Never commit, switch branches or push. The main session integrates.

| Section | Folder | Class prefix | Preview server (in `.claude/launch.json`) |
|---|---|---|---|
| Hero color wheel | `sections/hero/` | `hx-` | `hero` on 8771 |
| Projects: hover swap and rotating portfolio | `sections/work/` | `wk-` | `work` on 8772 |
| Ownerhound phone scroll | `sections/ownerhound/` | `oh-` | `ownerhound` on 8773 |
| About cutout and chrome star | `sections/about/`, `sections/star/` | `ab-`, `st-` | `about` on 8774 |
| Reference captures | `design/reference/` | none | none |

Each preview server serves the repo root, so open `http://localhost:<port>/sections/<name>/demo.html`.
