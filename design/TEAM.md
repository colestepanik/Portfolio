# Portfolio team: who does what, on which model

Cole's rule (Oct 28, 2026): the main chat is the project manager. It delegates by type of task, picks the model and effort for each agent, and does small things itself. No agent for every little thing.

## Roles

| Role | Who | Model | Effort | Gets work when |
|---|---|---|---|---|
| Project manager | Main chat | Opus 5.5 | as set by Cole | Always. Plans, writes briefs, integrates sections into `index.html`, reviews every agent's output before calling it done, talks to Cole. |
| Section builder | One linked session per big section | Opus 5.5 | high for a first build, medium for revisions | A new section or a redesign that takes hours and touches only its own `sections/<name>/` folder. |
| 3D and heavy motion | Linked session | Opus 5.5 | high | three.js, WebGL, complex scroll choreography. |
| Mobile QA (standing) | One persistent linked session, `mobile-qa` | Sonnet 5.5 | medium | After every front-end change lands in `index.html`. The same session every time, so it remembers past issues. |
| Capture and research | Linked session or in-chat subagent | Sonnet 5.5 | low | Screenshots, reading reference sites, docs lookups. |
| Mechanical work | Main chat, inline | n/a | n/a | Image conversion, renames, copy tweaks, single-file fixes, anything a handful of tool calls settles. |

## Standing roster (rebuilt Oct 28, 2026, after the section builds finished)

Role-based sessions replaced the per-section builders (hero, ownerhound, work, about-star, umass, reference), which were deleted the same day. Their decisions live in each `sections/<name>/NOTES.md`.

| Session | Id | Model, effort | Owns |
|---|---|---|---|
| `media` | `local_c79544ea-827a-4b13-8e47-9050f31a43c1` | Opus 5.5, medium | Cutouts (rembg), grading, image exports, video trims and posters. Writes only under `img/` and `video/`. |
| `builder` | `local_c74b9e84-e0bf-4471-b413-edb2197508cf` | Opus 5.5, low idle, raised to high for a build | New sections and redesigns, one `sections/<name>/` folder per brief. |
| `content` | `local_b310fc1b-3a02-4d8a-92f4-18a11801c830` | Sonnet 5.5, medium | Facts and copy across the timeline, print resume, JSON-LD, `llms.txt`, `brain.html`. Audits by default; edits only when the PM hands it a file. |
| `mobile-qa` | `local_d8e75e1a-a606-4248-997a-9d64461b1bbe` | Sonnet 5.5, medium | Mobile media queries only; log in `design/MOBILE-QA.md`. |
| Research | in-chat subagent | Sonnet 5.5, low | One-off lookups and captures. No standing session. |

Only the PM commits and pushes.

## Delegation rules
1. A few tool calls or one file: the PM does it, no agent.
2. Read-only digging across many files or pages: an in-chat subagent (Sonnet), result comes back here.
3. Hours of independent build work on its own files: a linked session, briefed against `design/DESIGN.md`.
4. Two agents never write the same files. Section sessions stay inside their folders; only the PM edits `index.html`, `site.css`, `brain.html`.
5. Revisions go back to the session that built the piece (it has the context), at medium effort.
6. Nothing is "done" on an agent's word: the PM checks the files and the page first.

## Mobile QA brief (for `mobile-qa`)
Widths 360, 375, 390, 430 and 768, portrait, plus 844 landscape. Each pass checks: no horizontal scroll; 16px side gutters; tap targets at least 44px; body text at least 16px; nothing pinned or sticky that traps scrolling; heavy effects (color wheel, phone scroll, chrome star) reduced or swapped for stills on small screens and under reduced motion; image weight per screen; layout shift on load. It fixes only inside mobile media queries and reports anything bigger to the PM.
