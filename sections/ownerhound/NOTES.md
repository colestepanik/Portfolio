# Ownerhound flagship section

Prefix `oh-`, root `<section id="ownerhound" class="oh">`. Preview: `ownerhound` server, `http://localhost:8773/sections/ownerhound/demo.html`.

This replaces the earlier pinned phone scroll story (Cole asked for one card instead of a long scroll).

## What it does
- **One card** about one viewport tall on desktop (max 1180px wide, 20px radius, dark surface with a soft blue glow). It sits on black and the section fades to pure black at the bottom.
- **Left: a phone drawn in CSS** with a slight 3D tilt (it straightens a little on hover) playing a 17 second click-through of the public ownerhound.com on sample data. The phone has a status bar strip (9:41, signal, battery) that `section.js` tints to match the top edge of the current video frame, so it reads like a real phone. Under the phone: "ownerhound.com, sample data" and a small pause and play toggle.
- **Right: the copy.** Pills (Flagship, Live with a green dot), the wolf mark, "Ownerhound", "A cold call workspace, *built by a cold caller.*" (second half in the italic serif), three short facts, the tags (Claude Code, Next.js, Supabase, Python, Vercel), and a white "Visit ownerhound.com" pill that opens a new tab.
- **900px and under:** stacks, phone first, no tilt. No sideways scroll at 375.
- **Playback:** the video plays only while at least 35% of it is on screen and pauses when it scrolls away (IntersectionObserver). If the browser refuses autoplay, the play button shows. Tapping the video or the toggle pauses or plays, and that choice sticks.
- **Reduced motion:** never autoplays. The poster (the Verify list) shows with a round play button, and the phone has no tilt.
- **No JavaScript:** the video keeps native `controls`, so it can still be played by hand.

Note on the markup: the brief suggested `<video autoplay ...>`. I left the `autoplay` attribute off on purpose. The script starts playback when the card is in view, so reduced-motion visitors never see it start, and nothing plays offscreen. `muted loop playsinline preload="metadata" poster` are all set.

## The video
- `video/ownerhound/ownerhound-phone.mp4`: H.264, 600x1298, 30 fps, 16.8 s, no audio, `+faststart`, 1.7 MB (`-sm` is 420px, 0.8 MB). Seamless loop: it starts and ends on the same home page frame.
- 2026-10-28: cut 7.7 s to 14.3 s of the original recording, where "Test it out" opened a second phone inside the phone. Cole found the phone-in-a-phone odd.
- `img/ownerhound/phone-poster.webp`: 600x1298 frame of the finished Verify list (High, Medium, Low), 31 KB.
- The path: home page, tap "See it work", the how-it-works animation (spreadsheet to call cards), scroll past "The whole call, on one screen", tap "Verify companies" and watch three sample companies get checked, then scroll back to the top. Every tap shows a soft white dot where it lands.
- How it was made: Playwright is not installed, so I drove headless Edge over the DevTools protocol (390x844 viewport at 2x, touch emulation, iPhone user agent), recorded with the built-in screencast, and encoded with ffmpeg. Public page only, sample data only, no sign-in. The recorder script lives in that session's scratchpad, not in the repo.
- No WebM: the VP9 encode stalled at 0:00 in Chromium while the MP4 played fine, and it only saved about 0.5 MB, so the section ships the MP4 alone (it plays in every current browser).

## Files
- `section.html`: the fragment. Paths are site-root relative (`img/...`, `video/...`), same as `index.html`.
- `section.css`: every selector starts with `#ownerhound` or `.oh-`. Reads `--black`, `--ease`, `--serif`, `--sans`, `--mono` from `site.css` when present, with fallbacks.
- `section.js`: one IIFE, no globals, no-op if `#ownerhound` is missing.
- `demo.html`: standalone preview with `<base href="../../">`. If `section.html` changes, paste it into `demo.html` again.
- `screenshots/`: `desktop-1440.webp` (mid-video), `desktop-1440-reduced-motion.webp` (poster with play button), `phone-375-video.webp`, `phone-375-copy.webp`.
- Removed: `img/ownerhound/phone-import.webp`, `phone-verify.webp`, `phone-call.webp`, `phone-home.webp` (used only by the old scroll story).
- `img/ownerhound/hero.webp` and `hero-sm.webp` are no longer used by this section, but the current `index.html` still uses them. Delete them after the swap if nothing else needs them.

## Integrating into index.html
1. In `<head>`, after `site.css`: `<link rel="stylesheet" href="sections/ownerhound/section.css">`. The Instrument Serif link from DESIGN.md must be on the page too.
2. Replace the whole old `<section class="section" id="ownerhound" ...> ... </section>` block with the contents of `section.html`.
3. Before `</body>`: `<script src="sections/ownerhound/section.js" defer></script>`.
4. Clean up the old styles that only the old section used: the "Flagship: Ownerhound" block in the inline `<style>` (`.flag-head`, `.flag-title`, `.browser*`, `.flag-points`, `.flag-foot`), unless something else still uses them.
5. The old section carried `data-scene="1"` and the backdrop rule `#ownerhound { view-timeline-name: --sc1; }`. The new section paints its own black background, so either keep or drop that hook.
6. The heading id changed from `ownerhound-title` to `oh-title`. Links to `#ownerhound` (nav, hero "See Ownerhound") still work.
7. The section sets its own padding (about 10vh on top, 12vh below), so it can sit straight under the hero.
8. Hosting: serve `video/` with normal static hosting. The file is small enough that no range-request setup is needed, but most hosts support it anyway.

## Open asks for Cole
- **Should you record your own phone instead?** Worth it if you want the real app (Queue, Due, scripts, follow-ups) rather than the public demo, or a screen recording with real iOS feel. Only do it on sample data, never on real call lists or real owner names and numbers. Record portrait, trim to 15 to 25 seconds, and send the file. It drops in as `video/ownerhound/ownerhound-phone.mp4` plus a new poster, with no code changes (re-encode to about 600px wide H.264 so it stays under 2 MB). If your recording already shows the iOS status bar, tell the PM so the CSS status bar strip can be turned off.
- The three facts are trimmed from the old section copy. Change them in `section.html` if you would say it differently.
