# About: big word, Cole cut out in front

A huge "About" in a white to grey vertical gradient, with Cole (in a suit) standing in front of it so his body covers the middle letters, then a short bio. After the reference `design/reference/from-cole/08-about-cutout.png`: same idea, our own build.

## Files
- `section.html`: the fragment. Root is `<section id="about" class="ab">`.
- `section.css`: every selector starts with `.ab`. Uses the `site.css` tokens (`--sans`, `--serif`, `--mono`, `--fg`, `--fg-2`, `--mute`, `--line`, `--bg`, `--ease`), with fallbacks.
- `section.js`: one IIFE. Swaps the placeholder for the photo once it loads, and arms the scroll-in for browsers without CSS scroll timelines.
- `cutout.py`: makes the cutout from any photo (see below).
- `demo.html`: standalone preview. Generated from the fragment, so if you edit `section.html`, paste it into the demo again. `?solo` hides the filler blocks above and below.
- `screenshot-desktop-1440.png`, `screenshot-phone-375.png`: current state, with the placeholder.
- Images: `img/about/` (empty until the photo is made).

## How it works
- Everything in `.ab-stage` is sized in em off `--ab-fs` (`min(27vw, 340px)`, `29vw` under 760px), so the word and the figure scale together. No horizontal scroll at 375 (checked: scrollWidth 375).
- Layers: glow (stage `::before`), word (z 0), figure (z 1), fade to black over the lower body (stage `::after`, z 2), bio (z 3, pulled up slightly into the fade).
- Photo slot: `img/about/cole-suit-cutout.webp` (desktop) and `img/about/cole-suit-cutout-sm.webp` (phones, under 700px wide), in a `<picture>`. The figure box is 1.5em tall and the photo fills that height with its natural width, centered. Until the file exists, a neutral SVG silhouette marked "PHOTO SLOT" stands in the same place. `section.js` adds `.ab-has-photo` when the photo loads, which hides the silhouette. If the photo 404s, the `<picture>` is removed and the silhouette stays. I tested this with a stand-in image and then deleted it.
- Scroll-in: the word rises out of a blur, then the figure settles from slightly large and low, then the bio fades up. Where `animation-timeline` is supported (Chrome, Edge) it is tied to scroll through a `view-timeline` on the stage. Elsewhere `section.js` adds `.ab-armed`, then `.ab-in` once on view (CSS transitions). Under `prefers-reduced-motion: reduce` nothing moves; the final state shows.
- With JS off, the swap never runs, so the silhouette shows even once the photo exists. In Chrome the scroll-in still works without JS; elsewhere nothing moves. All the text is still there. Once the real photo is in place, the main session can drop the placeholder and the swap so the photo shows with no JS too.

## Making the cutout
```bash
pip install "rembg[cpu]"
```
```bash
python sections/about/cutout.py path/to/cole-suit.jpg
```
- Removes the background (rembg, `isnet-general-use` model), trims to the person, and writes both webp files at 1200px and 700px tall.
- The layout wants the top of the head at the top of the image. For a waist-up shot use the default. For a full-length shot add `--keep 0.6` (keeps head to about mid-thigh; the section fades the rest out anyway).
- `--matting` gives cleaner hair edges and is slower. `--model u2net_human_seg` is an alternative model for people.
- rembg is not installed on this machine yet. Without it, the script prints the install command and exits.
- Best photo: plain background, even light, straight on or a slight angle, shoulders square, shot from about chest height, with room above the head. A dark suit reads best against the light letters.

## Integrate
1. In `index.html` `<head>`, add `<link rel="stylesheet" href="sections/about/section.css">` (after `site.css`; the Instrument Serif link is already required by the brief).
2. Paste `section.html` where About goes (after Skills and side projects, before the resume timeline). The image paths are relative to the repo root.
3. Before `</body>`, add `<script src="sections/about/section.js"></script>`.
4. The root id is `about`, so existing `#about` nav links keep working. If index.html already has an element with `id="about"`, remove or rename it.
5. The section has its own padding (72 to 140px top, 96 to 160px bottom) and a `#0a0a0b` background, so it blends with black neighbors.

## DRAFT copy for Cole to approve
Built only from the facts given. Nothing here is live until Cole signs off.

> **Lead:** From the family farm in Agawam to *building AI tools.*
>
> I grew up on my family's farm in Agawam, Massachusetts. Now I study Finance and Accounting at UMass Lowell and graduate in May 2027. I co-founded Commonwealth Capital Research, serve as Senior Class President, and co-captain the Intercollegiate Sales Team.
>
> I also build AI tools. My flagship is Ownerhound. Away from work it is rugby, powerlifting, snowboarding, and watches.
>
> **Facts row:** Home: Agawam, MA. School: UMass Lowell, May 2027. Building: Ownerhound. Off the clock: Rugby, powerlifting, snowboarding, watches.

"Ownerhound" links to https://ownerhound.com in a new tab.

## Open asks for Cole
1. **The suit photo.** Send it (see "Best photo" above), then run `cutout.py`. Until then the placeholder silhouette shows.
2. **Approve or edit the DRAFT copy** above: the lead line, both paragraphs and the facts row.
3. Should the facts row stay? It repeats the paragraph a little; it is there for skimmers.
4. Should "Ownerhound" in the bio link to ownerhound.com or jump to the Ownerhound section on the page?
