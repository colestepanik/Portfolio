# Hero (`sections/hero/`, prefix `hx-`)

Cole in his navy suit holding the Manning School of Business check, cut out and set into the background, with his name, one line and two buttons in front. A slowly rotating color wheel glows up from the bottom, and his lower body and the bottom of the check dissolve into it. The section still ends on pure black.

Preview: start the `hero` server, open `http://localhost:8771/sections/hero/demo.html`.
Demo flags: `?layout=behind` shows the layout that was not kept, `?start=120` sets the wheel's starting angle, `?shot` skips the entrance animation (used for the screenshots).

## Files
| File | What it is |
|---|---|
| `section.html` | The fragment: one `<section class="hx" id="hero">`. |
| `section.css` | All styles, every selector starts with `.hx`. Tokens live on `.hx` as `--hx-*`. |
| `section.js` | One IIFE: pauses the wheel while the hero is off screen. |
| `demo.html` | Standalone preview with a 68px nav stand-in and a black next section. |
| `screenshot-desktop-1440.png` | 1440 x 900, the kept layout. |
| `screenshot-phone-375.png` | 375 x 812 at 2x. |
| `screenshot-alt-behind-1440.png` | The desktop layout tried and not kept. |

Images: `img/hero/cole-check-cutout.webp` (896 x 1396, transparent) and `img/hero/cole-check-cutout-sm.webp` (600 wide). The old framed portrait and `img/photos/cole-portrait.webp` are no longer used by the hero.

## Layers, back to front
1. `.hx-bg`: the color wheel, the black fade (top, bottom, vignette) and a faint grain.
2. `.hx-figure`: the cutout, a `<picture>` positioned absolutely. A `mask-image` gradient keeps him solid down to about 58% of his height, then dissolves him to nothing by 94%, so the glow shows through his legs and the bottom of the check. Below that the section's own fade takes it to black.
3. `.hx-inner`: the headline, lede and buttons.

## Layout decision
Both were built and compared at 1440 x 900.
- Kept on desktop: text on the left, Cole on the right. He is looking toward the viewer's left, so his gaze leads into the headline. His face, the "$750" and his name on the check all stay readable, and nothing sits on top of him. The headline wraps to three lines in the left column, which reads fine at this size.
- Not kept: Cole centered behind the text. The headline lands on his chest and the check, so he has to be dimmed a lot, the check turns into a grey block, and the photo becomes clutter behind the type.
- Under 900px there is no room beside him, so he moves to the center behind the text: face and shoulders are clear between the nav and the headline, and his body is dimmed to about 30% then 14% under the text. The text sits at the bottom of the screen over the glow.

Sizes:
- Desktop: height `min(88vh, 1100px)` (so width `min(56.5vh, 706px)`), bottom anchored, right edge lined up with the 1240px content edge. That caps him at 1100 CSS px tall, as the source resolution allows.
- Under 900px: width `min(88vw, 480px)`, top at the nav's bottom edge.
- `sizes` on the `<img>` and the `<source>` match those widths exactly. Under 900px the `<source>` offers only the `-sm` file, so phones always get it. Above 900px the browser picks between the two by density: a 1x laptop gets `-sm`, a 2x screen gets the full file.

Checked: 1440 x 900, 1280 x 720, 1024 x 768 (text right edge 572, figure left edge 590, no overlap), 820 x 1180, 375 x 812 and 360 x 740. No horizontal scroll at any of them.

## The color wheel
- A conic gradient with the full spectrum, weighted so red and blue each hold about 80 degrees while cyan, green, yellow and orange pass in about 30 and are a little darker. At the starting angle red sits left, violet in the middle and blue right, like Cole's reference.
- It is masked to a soft ring and blurred once (`filter` on `.hx-wheel`, never animated). Only the parent `.hx-spin` rotates, with `transform`, one turn every 80 seconds.
- Measured in headless Chrome over DevTools for 3 seconds of rotation with the figure in place: 60fps median and p95 at 1440 x 900 and at 375 x 812 @3x, no main thread Paint events, about 40 raster tasks. A control that changed the blur every frame produced over 2,000.
- `section.js` pauses the rotation when the hero leaves the viewport.
- Reduced motion: the wheel holds still at its starting angle, the figure is static (no fade in), and all text is visible immediately.

Tuning knobs (set on `.hx`): `--hx-d` wheel diameter, `--hx-peak` how high the glow rises, `--hx-turn` seconds per turn, `--hx-start` starting angle. To change his size, edit `.hx-figure` width and update both `sizes` attributes to match.

## Headline
Default (built): "Cole Stepanik" in thin DM Sans (weight 250), "builds AI for finance." in big italic Instrument Serif.
Alternates, same pairing:
1. "Cole Stepanik" / "turns finance work into software."
2. "I'm Cole." / "I build the tools I need."

## Integration steps (main session)
1. `<head>`: keep or add the Instrument Serif link from DESIGN.md, then `<link rel="stylesheet" href="sections/hero/section.css">` after `site.css`. Replace any portrait preload with `<link rel="preload" as="image" href="img/hero/cole-check-cutout.webp" imagesrcset="img/hero/cole-check-cutout-sm.webp 600w, img/hero/cole-check-cutout.webp 896w" imagesizes="min(56.5vh, 706px)">` if you want one (optional; the img already has `fetchpriority="high"`).
2. Replace the current hero `<section>` in `index.html` with the contents of `section.html`. If the old photo scene script still references the hero (scene 0), drop it there or add `data-scene="0"` to `.hx`.
3. Before `</body>`: `<script src="sections/hero/section.js" defer></script>`.
4. The section pads its top by `var(--nav-h, 68px)`, so the fixed nav can sit over it. It ends on `#0a0a0b`; start the next section on the same black.
5. The buttons point at `#ownerhound` and `#resume`; both ids must exist. The section's own id is `hero`.
6. Buttons are self-contained (`.hx-btn-solid`, `.hx-btn-glass`) and do not depend on `.btn` in `site.css`.

## Open asks for Cole
- Pick the headline: the default or one of the two alternates.
- Glow strength and speed: one turn every 80 seconds at 88% opacity. Easy to make calmer or brighter.
- The cutout has a slightly hard edge along his left sleeve. A higher-resolution source photo would allow a cleaner cut and a taller figure on big screens.
