# Hero (`sections/hero/`, prefix `hx-`)

Type only on light "Concrete", after a brutalist personal site Cole picked (Oct 28, 2026). Replaces the suit cutout over the color wheel.

Preview: any server on the repo root (e.g. `work` on 8772), open `/sections/hero/demo.html` or `/index.html`.

## What it does
- **Background:** `#dcdcda` with the old SVG grain, its color matrix flipped to black specks, at 16% opacity. Ink `#0e0e0f`, muted `#4e4e52`.
- **Name:** "Cole Stepanik", DM Sans 600, letter-spacing -.045em, line-height .92. Sized with container query units off `.hx-inner` (`16.2cqi`, so about 98% of the 1176px column at 1440; `15vw` fallback). Under 640px each word is its own line at `28cqi` ("Stepanik" fills about 95% of the column at 375). It is the h1.
- **Headline for screen readers:** the h1 also holds " does the work, then automates it." as visually hidden text (`.hx-sr`), so it is read once. The band is `aria-hidden`.
- **Lede:** the old text, unchanged, 15 to 16px, `max-width: 31em` (3 lines on desktop and tablet, 4 on phones).
- **Let's talk:** semibold label, then `colestepanik39@gmail.com` as a mailto link. Replaces the two buttons; Ownerhound and Resume are in the nav at every width.
- **Band:** full width `#0e0e0f`, concrete colored text, "does the work, then automates it." in DM Sans 600 at `clamp(64px, 10.5vw, 168px)`. Two identical groups of two copies; the track moves exactly one group (`translateX(-50%)`) in 36 s, so there is no seam. Paused while the hero is off screen. The band is the bridge into the black page below.
- **Entrance:** the name rises in, then the lede, then the band fades in (about 1.5 s total).
- **Reduced motion:** every animation sits inside `prefers-reduced-motion: no-preference`, so the band stands still at its start ("does the work, then automates it." readable from the left edge) and nothing rises in.

## The nav (lives in `index.html` and `site.css`, not here)
- Markup in `index.html`: `<header class="nav nav--pill nav-on-light">`, brand "cs." (bold, tight, `aria-label="Cole Stepanik, home"`), and one `.nav-pill` holding Ownerhound, Projects, About, Resume and Contact (Contact is the light pill inside; Cole dropped 2nd Brain from it on Oct 28, 2026). The old roles ticker under the hero was removed the same day, and the band's top now fades from the concrete into the black (`--hx-fade`).

Band (Oct 28, 2026): the band scrolls 12 event photos (`.hx-band--photos`, 70 s loop) instead of the headline. Cole cut the "In the room" gallery section, so these are the only photos of him at events; the first group carries the alt text and the copy is aria-hidden. The files are `img/hero/band/*.webp`, 420px tall (2x the 210px band), webp q72, about 200 KB for all 12, made from `img/photos/gallery/`. To go back to text, swap the band's inner groups for `<div class="hx-group"><span>does the work, then automates it.</span><span>does the work, then automates it.</span></div>` (twice) and drop the `hx-band--photos` class. Under 760px only Ownerhound, Resume and Contact show; the pill items are 44px tall under 900px.
- Styles at the end of `site.css` under `.nav--pill` / `.nav-pill` / `.nav-on-light`. `brain.html` keeps the old nav, untouched.
- Over the light hero (`.nav-on-light`): ink "cs.", black pill, concrete text, concrete Contact pill. No bar until you scroll; then a light frosted bar so the name reads under it.
- Past the hero: the usual dark frosted bar, glass pill, light text, white Contact pill. Colors ease over .3 to .4 s.
- `section.js` sets `.nav-on-light` with an IntersectionObserver on `.hx-inner` whose root margin leaves only a nav-height strip at the top, so it flips exactly when the black band reaches the nav. Rebuilt on resize. `index.html` ships the class already on, so there is no flash at load.
- The 2px scroll progress line now uses `mix-blend-mode: difference`, so it shows as ink over the concrete.

## Files
| File | What it is |
|---|---|
| `section.html` | The fragment: one `<section class="hx" id="hero">`. |
| `section.css` | All styles, every selector starts with `.hx` (plus `@keyframes hx-`). |
| `section.js` | One IIFE: pauses the band off screen, toggles `.nav-on-light` on `#nav`. |
| `demo.html` | Standalone preview with the real nav markup and a black next section. Paste `section.html` in again if it changes. |
| `screenshot-*.png` | Out of date: they show the old suit and color wheel hero. |

`img/hero/` is no longer used by the hero; left in place for the PM to clean up. The og:image tags still describe the old photo (Media will reshoot).

## Checked
1440, 1024, 768, 390 and 375: no horizontal scroll, the name fills the column, the nav reads over the hero and after scrolling, the pill fits (at 390 it spans x 99 to 374 beside "cs.").
