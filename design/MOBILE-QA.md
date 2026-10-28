# Mobile QA log (standing session `mobile-qa`)

Method: headless Edge over CDP with device metrics and touch emulation (DPR 2), motion on and `prefers-reduced-motion: reduce`, plus the built-in browser. Audit script measures scrollX after `scrollTo(500, y)`, overflowing elements, tap target sizes, nav fit, pin state, hero image, star canvas. Shots live in `design/mobile-qa/`.

## Still open (for the project manager)
1. **Ownerhound video is 1.68 MB and 600x1298, shown about 214 to 233 px wide on phones.** It downloads in full at every width (not under reduced motion). Make a phone cut (about 360 px wide, a few hundred KB) and serve it with a `media` source, or `preload="none"` until near view. Markup.
2. **Hero portrait `sizes`** was fixed in pass 3 (hero now loads `cole-check-cutout-sm.webp` at every width checked). Closed.
3. **Gallery `sizes`** still `(max-width: 760px) 100vw` while the grid is 2 columns: 430 px phones fetch the 1600w files (g4.webp 272 KB; 2.3 MB image transfer at 430 in the earlier run). Suggested `sizes="(max-width: 640px) 50vw, (max-width: 899px) 33vw, 400px"`. Markup. Re-check next pass.
4. Small labels stay under 16 px on purpose (mono pills, tags, dates, class and role lines in UMass cards, copyright).
5. Star runs live on phones at 1.5x: still smooth in emulation, but headless Edge is not a phone GPU. Needs one real-device look.
6. Not yet checked: real-device scroll jank and video playback on iOS Safari (muted and `playsinline` are set).

## Pass 1: 2026-10-28
Widths: 360x780, 375x812, 390x844, 430x932, 768x1024 portrait, 844x390 landscape. Both motion and reduced motion.

### Passing at every width
- No horizontal scroll: `scrollX` stays 0 after `scrollTo(500, 400)`, `scrollWidth` equals viewport, no unclipped overflowing elements.
- Fixed nav fits one line at 360 (content ends at 344 of 360), 67 px tall.
- 16 px gutters (wraps, hero, ownerhound, work, about all inset 16).
- Ownerhound phone does not pin: `.oh-stage` is `display: none` at every width up to 900, steps stack with their own phone. The sticky `.oh-pin` has zero height.
- Hero color wheel: still animated on phones (80 s rotation, paused off screen). Static under reduced motion (`animationName: none`).
- Images: work tiles and showcase serve `-sm` (328 and 800 px); gallery uses `srcset` 800w/1600w; star and ownerhound shot use `-sm` srcsets. Nothing over 80 KB loads in the first screen (largest: portrait 76 KB). Total image transfer for a full scroll about 500 KB.
- Layout shift: `layout-shift` entries total 0.000 on load and scroll.
- Reduced motion: star falls back to the poster, work showcase stands still, reveals all visible, wheel static.

### Issues
| # | Section | Width | What | Status |
|---|---|---|---|---|
| 1 | Nav | 360 to 844 | Brand 15 px tall, links 38 to 40 px, Contact button 38 px: under 44 | **Fixed** `site.css` (min-height 44, `.btn.sm` 44) |
| 2 | Footer | all small | Link rows 34 px tall; copy 15 px | **Fixed** `site.css` (min 44 px, 16 px) |
| 3 | Work showcase | 360 to 899 | "Pause motion" toggle 38 px | **Fixed** `sections/work/section.css` |
| 4 | Work, Resume, About | 360 to 899 | Body copy 14 to 15 px (points, quiz foot and options, link, experience lists, wins, skills, facts, contact line, timeline org names) | **Fixed** to 16 px in the mobile queries of `index.html`, `sections/work/section.css`, `sections/about/section.css`, `site.css` |
| 5 | Roles ticker | 360 to 899, reduced motion | Wrapped list still clipped ("Commonwealth Capital Resear...") because `.roles-track` was `width: max-content` | **Fixed** `index.html` (mobile + reduced motion block) |
| 6 | Contact | all | "Inquiries" heading touching the Email button | **Fixed** mobile only; desktop open (#3 above) |
| 7 | Hero | 360 | Tried 16 px hero buttons: the two buttons wrapped to two rows | **Reverted**, buttons stay 15 px, still 48 px tall |
| 8 | Hero image | phones | Full-size portrait | **Escalated** (#1) |
| 9 | Star | phones | Live WebGL at DPR 2 | **Escalated** (#2) |
| 10 | Resume copy | phones | Subtitle mentions left and right | **Escalated** (#4) |
| 11 | Gallery | phones | Very long single column | **Escalated** (#5) |

Screenshots: `design/mobile-qa/360-hero-roles-before.png` and `-after.png`, `360-contact-footer-before.png` and `-after.png`.

Files touched: `site.css`, `index.html` (inline style only), `sections/work/section.css`, `sections/ownerhound/section.css`, `sections/about/section.css`. All edits sit inside `max-width: 899px` or smaller media queries.

## Pass 2: 2026-10-28 (recheck of the PM fixes)
Widths: 360, 375, 390, 430, 768, 844 landscape (regression sweep), plus a throttled run at 360.

| # | Item | Result |
|---|---|---|
| 1 | Hero srcset | Partly OK. 360 and 375 load `cole-portrait-sm.webp`; 390, 430, 768 load the full file because `sizes` says `80vw`. Escalated (open #1) |
| 2 | Star pixel ratio | OK. Canvas 540x519 at 360 (1.5x), 645x619 at 430. Poster-only on phones left to Cole (open #3) |
| 3 | Contact gap | OK. Mobile duplicate left in `index.html`, harmless |
| 4 | Resume subtitle | OK, reads "School and career, year by year." |
| 5 | Gallery 2 columns | Layout OK at 360 and 430: 2 columns, 10 px gaps, no overflow, no captions present, height 1089 at 360 (was about 4,500), 1314 at 430. Image weight is not OK because of `sizes` (open #2). Shot: `design/mobile-qa/360-gallery-2col.png` |
| 8 | Hover-swap on touch | OK. With `(hover: none)` the tile auto-cycles to the second image while in view (seen flipping at about 4 s and back at 6 s); tile toggle button present |
| 8 | Throttled load (4x CPU, 150 ms latency, 200 KB/s) | Layout shift 0.004 at 360, well under 0.1 |

Regression sweep: `scrollX` 0 and no unclipped overflow at all six widths, nav links 44 px tall, nav fits at 360, no new sub-44 tap targets (only the exempt inline link). No CSS changes this pass.

## Pass 3: 2026-10-28 (new hero, video card, #umass, 4 work tiles)
Widths: 360, 375, 390, 430, 768, 844 landscape; motion and reduced motion at each.

Passing everywhere: `scrollX` 0, no unclipped overflow (the Riverhawk watermark in `#umass` is clipped), nav one line at 360 and links 44 px, layout shift 0.000, About figure stays fully opaque while scrolling in (minimum opacity 1; only the word fades), star canvas at 1.5x (540x519 at 360, 645x619 at 430) and smooth: 99 frames while scrolling past at 390, p50 and p95 16.7 ms, none over 33 ms (headless, so indicative only).

| # | Section | Result |
|---|---|---|
| 1 | Hero | OK. Cutout sits behind the text from 360 to 768, headline and lede stay readable over the dimmed lower body, buttons 48 px, `-sm` loads (317 to 480 px displayed), no overflow. |
| 2 | Ownerhound video | Attributes OK: `muted`, `playsinline`, `preload="metadata"`, controls removed by JS, plays only while 35% in view and pauses offscreen (`section.js:71`). Poster and play button show under reduced motion, and no video bytes load there. Weight 1.68 MB on phones: escalated (open #1). The pause button was a 28 px circle: **fixed** (`sections/ownerhound/section.css`, invisible 44 px hit area). Fact list and CTA to 16 px: **fixed**. |
| 3 | Work | OK. Four tiles, single column to 760, two columns above, widths 328 to 398 on phones, no overflow. |
| 4 | About | OK, see opacity result above. |
| 5 | #umass | OK. 1 column at 360 to 640 (rows with logo tile), 2 columns at 768 and 844, AIM card full width, no overflow. Card name links measure 22 to 43 px but stretch over the whole card, so the real target is the card; Visit AIM button 48 px. |
| 6 | Timeline | OK. "Oct 2025 to Spring 2026" wraps to two lines at 360 and 375 only, no clipping. |
| 7 | Star | OK, see above; real-device check still open. |
| 8 | Roles ticker | OK. Motion: one line, 80 px tall, scrolls. Reduced motion: wraps, no clipping at 360 to 768 (322 px tall at 360). |

CSS changed this pass: `sections/ownerhound/section.css` only (inside the `max-width: 900px` query). Screenshots of pass 3 layouts were inspected but not saved as before/after pairs, since nothing visual changed.

**PM, Oct 28 (after pass 3):** open #1 closed. Added `video/ownerhound/ownerhound-phone-sm.mp4` (420 px wide, 723 KB, was 1.68 MB) as a `<source media="(max-width: 899px)">` ahead of the full file. Verified: 390 wide plays the -sm file, 1440 plays the full file, both autoplay.
