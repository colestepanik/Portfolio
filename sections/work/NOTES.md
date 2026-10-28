# Skills and side projects (`sections/work/`, prefix `wk-`)

Replaces both `#work` (the stack cards) and `#building` (the bento) in the current `index.html`. Four projects live here: 2nd Brain, READ Market Engine, CCR Research Pipeline, AIM Resume Checker. SIE Prep App (and its quiz) and AIM Slack Bot were removed on Oct 28, 2026 at Cole's request.

Preview: `work` server on 8772, open `http://localhost:8772/sections/work/demo.html`.

## What it does

- **Head:** "Tools I built" in light sans over "and use for real." in big italic serif, then the lede.
- **Tiles** (12 column grid): 2nd Brain as a wide feature tile (image left), then READ Market Engine (7) next to CCR Research Pipeline (5), then AIM Resume Checker as a wide feature tile with the image on the right. Below 960px every tile is full width, so there are no holes at any width. Every tile keeps its facts, pills, points and tags from the old page. 2nd Brain links to `brain.html` ("Build your own, step by step").
- **Hover swap:** each tile has a cover and a second image. On hover, the second image is revealed by a circle that grows from where the pointer enters and follows it, while the cover dims and eases in. Keyboard focus anywhere in the tile does the same from the center. The whole image is a toggle button (`aria-pressed`), and two dots in its corner show which image is up.
  - Phones (`hover: none`): each tile cycles on its own every 3.4 to 4.4 s while on screen; a tap swaps it by hand and stops that tile's cycle.
  - Reduced motion: no circle, no scale, a plain 0.35 s crossfade, no auto cycle.
- **Rotating portfolio (showcase):** a tilted grid of six columns that drift up and down in opposite directions at different speeds (58 to 86 s per loop), all edges masked into black, with "Built for real work." over the middle.
  - Why a tilted grid and not a 3D ring: the images are 16:10 screenshots with small text. A grid keeps every one flat and readable, it is the look of Cole's reference (`06-template-grid-step1.png`), it costs only CSS transforms, and it fills a 375 wide phone. A ring shows half its panels edge-on or from behind and needs much more height on a phone.
  - Pauses on hover and when off screen (IntersectionObserver). The "Pause motion" button was removed at Cole's request; note this drops the WCAG 2.2.2 pause control for desktop keyboard and touch users, and reduced motion is now the only way to stop it.
  - Six columns of five covers drawn from the eight remaining images (each column in a different order); JS clones each set twice and the loop moves exactly one set, so there is no seam.
  - Reduced motion: the grid stands still. Without JS it is still.
- The section background is `#0a0a0b` and the showcase fades out at the bottom, so the section ends in black.

## Files

| File | What |
|---|---|
| `section.html` | The fragment. Root is `<section class="wk" id="work">`. Image paths are relative to the site root (`img/work/...`). |
| `section.css` | Every selector starts with `.wk` or `@keyframes wk-`. Uses `--sans`, `--serif`, `--mono`, `--ease` from `site.css` (with a fallback for `--ease`). |
| `section.js` | One IIFE, runs on DOMContentLoaded, exits if `#work.wk` is missing. No libraries. |
| `demo.html` | Standalone preview. Uses `<base href="../../">` so the fragment's root relative paths work. |
| `screens/` | `desktop-1440.jpg` (full section), `phone-375.jpg` (full section at 2x). |
| `../../img/work/` | 8 covers (`brain`, `read`, `ccr`, `resume`, each `-a` and `-b`), each at 1600x1000 (`<key>.webp`) and 800x500 (`<key>-sm.webp`). Tiles use `srcset`; the showcase uses the small ones. |

## How to integrate (main session)

1. In `index.html`, replace the whole `<section id="work">` and the whole `<section id="building">` with the contents of `section.html`.
2. In `<head>`, add `<link rel="stylesheet" href="sections/work/section.css">` after `site.css` (the Instrument Serif link from DESIGN.md is needed too). Before `</body>`, add `<script src="sections/work/section.js" defer></script>`.
3. Delete the old SIE quiz script (the quiz is gone from this section too) in `index.html` (the block that starts `/* ---- SIE sample question ---- */` and reads `#quiz-foot` and `.quiz-opt`). It finds nothing once the old markup is gone, so it is dead code, not a crash. The old `.quiz*`, `.stack`, `.card*`, `.bento`, `.cell` rules can go too, unless something else uses them.
4. Anchors kept: `#work` (nav, and `brain.html` links to `index.html#work`), `#second-brain`, `#read-market-engine`, `#ccr-research-pipeline`, `#aim-resume-checker`. **Gone:** `#sie-prep-app` (linked from the footers of `index.html` and `brain.html`), `#aim-slack-bot` and `#building`. Nothing links to `#building`, but the print stylesheet in `index.html` (line ~522) lists it and can drop it. If print hides `#work`, the new section is hidden in print too, same as before.
5. The section brings its own top padding (96 to 160 px) and no bottom padding: the showcase is the fade into the next section.

## Images: what is real and what Cole should replace

Real (captured from pages and files we own, then framed on a dark glow):

| Slot | Source |
|---|---|
| `brain-a` | `brain.html` hero, captured at 1440x900 |
| `brain-b` | `brain.html` Phase 1 "Build the vault" plus the "Who should interview you?" picker |
| `read-a`, `read-b` | `img/read-trade-idea.webp` and `img/read-review.webp` |
| `ccr-a` | Page 1 of CCR Issue 006, "The Chips That Finance Themselves" |
| `ccr-b` | Exhibit 1 from Issue 006, "The circuit, clockwise" |

Designed placeholders (type and gradient, abstract shapes and grey bars, no invented text). **Replace these with real screenshots when Cole has them**, same names, 1600x1000 plus an 800x500 `-sm`:

| Slot | Now | Wanted |
|---|---|---|
| `resume-a` | "Resume Checker" type with an abstract resume and feedback card | Screenshot of the Lovable app with feedback on a resume |
| `resume-b` | "Pick your field." with five rows labeled "Vertical 1" to "Vertical 5" | The real vertical picker screen (the five vertical names) |

## Open asks for Cole

1. OK to show CCR Issue 006 pages (title, deck and first paragraphs are legible in `ccr-a`)? If not, swap `ccr-a` and `ccr-b` for another published issue.
2. The five Resume Checker verticals, so `resume-b` can name them.
3. A Lovable URL for the Resume Checker, if it is public, so that tile can link out like 2nd Brain does.
