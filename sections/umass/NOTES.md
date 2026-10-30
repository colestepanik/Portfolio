# My time at UMass Lowell: club cards over a Riverhawk watermark

Sits directly under About. A big "My time at *UMass Lowell*" heading (thin sans plus italic serif, same white to grey gradient as the About word), a short intro, then a bento of club cards. AIM is first and biggest, with a white "Visit AIM" button. Behind everything, the Riverhawk mascot as a faint grey watermark (about 6.5% white on black) that melts into black at the top and bottom of the section.

## Files
- `section.html`: the fragment. Root is `<section id="umass" class="um">`.
- `section.css`: every selector starts with `.um`. Uses the `site.css` tokens (`--sans`, `--serif`, `--mono`, `--fg`, `--fg-2`, `--mute`, `--line`, `--line-strong`, `--glass-line`, `--paper-ink`, `--paper-ink-2`, `--bg`, `--ease`, `--max`), with fallbacks.
- `section.js`: one IIFE. Opens external card links in a new tab, and arms the reveal on scroll.
- `demo.html`: standalone preview, generated from the fragment. After editing `section.html`, run `python sections/umass/make_demo.py`. `?solo` hides the filler blocks above and below.
- `process_logos.py`: rebuilds every processed logo from `img/umass/raw/` (Pillow only). Run from the repo root: `python sections/umass/process_logos.py`.
- Screenshots: `screenshot-desktop-1440.png`, `screenshot-tablet-820.png`, `screenshot-phone-375.png`, `screenshot-phone-360.png`.
- Images in `img/umass/` (raw originals untouched in `img/umass/raw/`):

| File | From | Treatment | Size |
|---|---|---|---|
| `riverhawk-watermark.webp` | `14.png` | black ink turned into white on transparent; CSS sets the opacity and masks | 992x654, 16 KB |
| `aim.webp` | `15.png` (`19.png` is the same file) | source is only 197px wide, so the alpha was upscaled 4x and re-sharpened | 760x243, 8 KB |
| `ccr.webp` | `17.jpg` | gradient background knocked out, white letters kept | 360x156, 6 KB |
| `seniors.webp` | `16.png` | dark wavy background knocked out, white mark kept | 300x286, 10 KB |
| `sales-team.webp` | `20.png` | dark background knocked out, white mark kept | 373x300, 13 KB |
| `accounting-society.webp` | `18.png` | already transparent (white type, gold column), trimmed | 466x200, 14 KB |
| `accounting-society-2.webp` | the file above | all white (Oct 29, 2026), trimmed to the ink; the card sets `--w: 270px` so it shows about 20% bigger | 436x169, 10 KB |
| `umlfs.webp` | `21.png` | white background knocked out; navy "FS" turned white so it reads on black; blue "UML", navy bar and green ticker kept | 480x166, 12 KB |

Total image weight for the section: about 79 KB.

## How it works
- Layout: 3 columns over 1000px, with AIM spanning 2 columns and 2 rows (CCR and Seniors stack beside it, the other three below). 641 to 1000px: 2 columns, AIM full width, the odd last card (UMLFS) full width as a row. 640px and under: one column, AIM first as a full card with a full-width 48px "Visit AIM" button, the rest as compact rows with a logo tile on the left.
- Order: AIM, CCR, Senior Class, Intercollegiate Sales Team, Accounting Society, UML Finance Society.
- Watermark: `.um-bg` covers the section and carries a vertical mask (transparent at top, solid 24% to 68%, transparent at the bottom), so the hawk fades into black with no edge. The image also has a soft radial mask. On phones it is scaled up and shifted so the head and beak show. Where `animation-timeline` is supported it drifts a little with scroll.
- Reveal: `section.js` adds `.um-armed`, then `.um-in` to the header and each card as it comes into view; cards rise in with a short stagger from `--i`. Under `prefers-reduced-motion: reduce` nothing is armed and nothing moves. With JS off, everything shows.
- Logo balance: `--s` on a card scales one logo down when its ink is heavier than the rest (CCR uses `--s: .7`).
- Checked: no horizontal scroll at 360 and 375 (scrollWidth equals the width), "Visit AIM" is 48px tall, body text on phones is 16px or more; only the mono labels (dates, eyebrow, "Featured") are smaller. On desktop the card notes are 15px.

## Adding a link to a card (one attribute)
Every card name is an `<a>` with no `href`, so it renders as plain text. To link a card, add `href`:
```html
<h3 class="um-name"><a href="https://example.org">Commonwealth Capital Research</a></h3>
```
That alone makes the whole card clickable (a stretched link), shows the arrow in the corner, adds the hover lift and a focus ring, and `section.js` opens it in a new tab when it points to another site. No other changes needed. AIM is the only card linked today, through its "Visit AIM" button (https://www.aimsociety.org/projects), which also covers its whole card.

## Integrate
1. In `index.html` `<head>`, add `<link rel="stylesheet" href="sections/umass/section.css">` after `site.css`. The Instrument Serif link is already required by the brief.
2. Paste `section.html` directly after the About section (`</section>` of `#about`). Image paths are relative to the repo root.
3. Before `</body>`, add `<script src="sections/umass/section.js"></script>`.
4. Root id is `umass`. If a nav item should point here, use `#umass`. Nothing else on the page should use that id.
5. The section has its own padding (80 to 140px top, 96 to 160px bottom) and a `#0a0a0b` background, so it blends with About above and whatever sits below.
6. Optional: if `llms.txt` lists sections, add the club roles from the cards.

## DRAFT copy for Cole to approve
Built only from the facts given and the AIM projects page. Nothing here is final until Cole signs off.

> **Eyebrow:** Manning School of Business. Class of 2027.
>
> **Heading:** My time at *UMass Lowell*
>
> **Intro:** Finance and Accounting, graduating May 2027. Outside class, these are the clubs where I spent most of my time, and the roles I took on in each.
>
> **AIM (featured):** AI Multidisciplinary Society. Finance Chair, 2026. "Mixed teams of students from every major building real AI projects, like AIM Flow and Coal2Core." Button: Visit AIM (aimsociety.org).
>
> **CCR:** Commonwealth Capital Research. Co-Founder and President. Since Jan 2025. "Student investment research group, 20+ members."
>
> **Seniors:** UMass Lowell Seniors. Senior Class President. Class of 2027, elected spring 2026.
>
> **Sales:** Intercollegiate Sales Team. Captain. Member Oct 2025, Captain spring 2026. "1st place at the Pfizer, Medicus and ALKU sales competitions."
>
> **Accounting Society:** Communications Chair. Since Feb 2025.
>
> **UML Finance Society:** Treasurer. 2024.

## Open asks for Cole
1. **Links still needed** (none invented; add each as `href` per the section above):
   - Commonwealth Capital Research (website, LinkedIn or Instagram)
   - UMass Lowell Seniors / Class of 2027 (Instagram or class page)
   - Intercollegiate Sales Team
   - Accounting Society
   - UML Finance Society
2. **What are `22.png` (a plain black "B") and `23.png` (an illustrated Ben Franklin portrait)?** They are left off the page until Cole says which clubs they belong to, his role, dates and any link. Both have white or light backgrounds and will need the same knockout treatment.
3. **A bigger AIM logo.** The supplied file is 238x130 with only 197px of ink, so the processed version is an upscale and its corners are slightly soft at the featured size. An SVG or a 1000px+ PNG from AIM would make the most prominent card crisp.
4. **Approve or edit the DRAFT copy** above, especially the intro line and the AIM one-liner.
5. **Accounting Society and UML Finance Society:** still active, or past roles? The cards say "Since Feb 2025" and "2024".
6. Is the watermark the right strength? It is set to 6.5% (`.um-hawk { opacity: .065 }`, `.07` on phones). Lower it for subtler, raise it for more presence.
