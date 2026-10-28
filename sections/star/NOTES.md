# Chrome star: polished asterisk above the footer

A 5-armed asterisk in polished dark chrome, rising out of black and fading back into it, with reflections that slide across the metal as it slowly turns. After the reference `design/reference/from-cole/09-chrome-star.png`: the geometry, studio and code are ours.

History: a faceted, uneven-arm "revision 2" was tried on Oct 28 and rolled back at Cole's request; this is the original rounded star.


## Files
- `section.html`: the fragment. Root is `<section id="star" class="st" aria-hidden="true">` (decorative, nothing to read).
- `section.css`: every selector starts with `.st`.
- `section.js`: one IIFE, no globals. Loads three.js with a dynamic `import()` only when needed.
- `demo.html`: standalone preview, generated from the fragment. `?solo` hides the filler blocks; `?st-poster` renders the poster frame on a transparent page.
- `screenshot-desktop-1440.png`, `screenshot-phone-375.png`: the live WebGL star. `screenshot-desktop-1440-reduced-motion.png`: the poster fallback (it matches the live view).
- Images: `img/star/star-poster.webp` (2400x1500, 41 KB) and `img/star/star-poster-sm.webp` (1000x625, 19 KB), both with a transparent background.

## How it works
- **Library:** three.js `0.180.0`, ES module build from cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js` (it pulls `three.core.min.js` from the same folder). Pinned exactly. Only core three.js is used, no addons.
- **Geometry:** a 2D outline of five straight arms with round tips, joined by soft concave fillets, extruded with a deep round bevel so each arm is nearly a tube. The mesh is welded so normals blend across the bevel; the flat caps keep exact flat normals so the mirror finish has no seams.
- **Material:** `MeshPhysicalMaterial`, metalness 1, roughness 0.1, clearcoat 0.8, light grey base, ACES tone mapping.
- **Reflections:** a procedural studio (a near-black dome plus six bright light strips) baked once through `PMREMGenerator.fromScene`. The studio turns slowly via `scene.environmentRotation`, and the star sways gently, so the white streaks slide along the arms. It leans a little toward the pointer, eased.
- **Framing:** the camera fits the star to the stage height with its center 62% down, so the lower arms run into the bottom fade. The stage is `clamp(380px, 52vw, 760px)` tall (`clamp(320px, 96vw, 460px)` under 760px). CSS gradients fade the top and bottom into `#0a0a0b`, over a faint radial glow.
- **Performance:** nothing loads until the section is within 600px of the viewport. Rendering stops when the stage is offscreen or the tab is hidden. Pixel ratio is capped at 2 on desktop and 1.5 on phones (`max-width: 760px` or a coarse pointer). Resizes are handled with a ResizeObserver.
- **Fallbacks:** the poster `<img>` is in the markup and shows by default. It stays for no WebGL, `prefers-reduced-motion: reduce`, no JS, or if the CDN fails (a console warning says why). When the live star draws its first frame, the section gets `.st-live` and the canvas fades in over the poster. The poster was rendered from this same scene (`?st-poster`), so the switch is nearly invisible.

## Remaking the poster
If you change the geometry, material or framing, render the poster again. Serve the repo (the `about` server on 8774), then:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars --window-size=1200,750 --force-device-scale-factor=2 --default-background-color=00000000 --virtual-time-budget=8000 --screenshot=poster.png "http://127.0.0.1:8774/sections/star/demo.html?st-poster"
```

Then save `poster.png` as `img/star/star-poster.webp` (2400x1500) and a 1000x625 copy as `star-poster-sm.webp`, keeping the alpha channel (Pillow: `save(..., "WEBP", quality=84, method=6)`). Keep the 16:10 aspect: the poster's framing only matches the live camera at that ratio.

## Integrate
1. In `index.html` `<head>`, add `<link rel="stylesheet" href="sections/star/section.css">`.
2. Paste `section.html` directly above the footer, after Contact. The image paths are relative to the repo root.
3. Before `</body>`, add `<script src="sections/star/section.js"></script>`. A classic script is fine; it uses `import()` inside.
4. If another section also loads three.js, use the same URL (0.180.0 module build) so the browser fetches it once. Two different versions would both download.
5. The section is just the visual. Footer text, links or the contact CTA belong to the footer, which can sit right under it or overlap the bottom fade with a negative margin.
6. CSP note: if a Content-Security-Policy is ever added, `script-src` needs `https://cdnjs.cloudflare.com`. A dynamic import cannot carry an SRI hash, so if that matters, self-host `three.module.min.js` and `three.core.min.js` under a `vendor/` folder and change `THREE_URL`.

## Verified
- Live render at 1440 and 375 in headless Chrome. Frames at different times differ, so the motion runs. Phone live and poster framing match.
- Reduced motion shows the poster, and three.js never loads.
- No horizontal scroll at 375 (scrollWidth 375). The wider poster is clipped inside the section.
- Not checked: pointer lean on a real mouse (headless has no pointer). Safari and Firefox were not tested here; they get WebGL plus the same code, and the poster if anything fails.

## Open asks for Cole
1. Is dark chrome right, or would you like it brighter and more silver? That is one line: `color` and the strip strengths in `section.js`.
2. Speed: the studio turns about once every 30 seconds and the sway is gentle. Should it be faster or slower?
3. Should it sit alone above the footer, or have a line of text over the fade (for example a sign-off or the contact CTA)?
