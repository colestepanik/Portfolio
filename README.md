# Cole Stepanik portfolio

Two pages: `index.html` (portfolio and resume) and `brain.html` (the Build your own 2nd Brain guide), sharing `site.css`. Dark grey, photographic, Mercury-inspired.

| File | What it does |
|---|---|
| `index.html` | The site. The resume shows as a timeline: one arrow running down the page with a branch for each role (school on the left, career on the right); the full resume stays in the HTML (hidden on screen) for search engines, AI crawlers, and the Full resume (PDF) button, plus JSON-LD structured data. |
| `llms.txt` | Plain-text summary written for AI crawlers (ChatGPT, Claude, Perplexity). |
| `robots.txt` | Explicitly allows search and AI crawlers. |
| `sitemap.xml` | Tells Google what to index. |
| `brain.html` | The 2nd Brain guide: Claude or ChatGPT chooser, Windows/Mac toggle, checkable steps, HowTo structured data. |
| `site.css` | Shared tokens, nav, buttons, glass panels. |
| `kit/` | Starter kit downloads: vault template zip, /brain skill zip (Claude), Project instructions (ChatGPT), interview questions. |
| `fonts/` | Self-hosted DM Sans and Geist Mono. |
| `img/` | Background photos (`bg-*.webp`, from Unsplash), real READ Market Engine pages, and logos in `img/logos/`, all converted to white marks on transparent (`*-white.webp`): UMass Lowell from Wikimedia Commons, Franklin Templeton from Wikipedia, and your CCR, A.I.M., Sales Team, Seniors Class of 2027, and Accounting Society files. The Anoush Holdings mark is a type recreation (Libre Baskerville) because the original image didn't come through; swap in the real file as `img/logos/anoush-white.webp` if you have it. |

Scroll animations are pure CSS (scroll-driven animations) with an IntersectionObserver fallback, and everything goes static for visitors with reduced motion turned on. Firefox gets the reveals but not the scroll-linked effects; nothing breaks.

## Testing backgrounds

Open `index.html?test` to show the tester bar at the bottom. **Look** picks which of the two photos (night peak, starry range) sits behind each section; the default is **3, Peak only**: one photo the whole way down that dims under the content as you scroll. **Blend** only matters for looks where the photo changes between sections (Dissolve fades straight across, Edge colors fades through a gradient of the two photos' edge colors, Black dips through near-black). Choices are saved in the URL (`?look=3&tx=none`). Visitors never see the tester unless `?test` is in the link.

## Go live (about 20 minutes, ~$12 a year)

1. **Buy the domain.** `colestepanik.com` at Cloudflare Registrar or Namecheap. If it is taken, pick another and find-replace `colestepanik.com` across all five files.
2. **Make a GitHub repo** named `colestepanik.github.io` (public). Upload every file and folder here (including `fonts/`, `img/`, and `kit/`).
3. **Turn on Pages:** repo Settings → Pages → Source: Deploy from branch → `main` / root. Once you own the domain, enter `colestepanik.com` under Custom domain (GitHub adds a `CNAME` file for you) and tick Enforce HTTPS once it is offered.
4. **Point DNS** at your registrar:
   - Four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` for `www` → `colestepanik.github.io`
5. **Get indexed:** add the site in Google Search Console and Bing Webmaster Tools (Bing feeds ChatGPT search and Copilot), verify via DNS, submit `https://colestepanik.com/sitemap.xml`.
6. **Link it everywhere:** LinkedIn Contact info → Website, LinkedIn Featured section, email signature, resume header. Inbound links from your own profiles are what tie "Cole Stepanik" searches to this page.

## Adding a walkthrough video

Each featured project card has a `.card-visual` panel on the right (a background photo with the content on top). Once a recording exists, put the file in a `videos/` folder and replace that panel's contents with:

```html
<video src="videos/read-market-engine.mp4" controls muted playsinline preload="metadata"></video>
```

Keep clips under ~25 MB (GitHub's limit per file is 100 MB) or upload to YouTube and embed instead.

## Updating

Edit `index.html`, bump `dateModified` in the JSON-LD and `lastmod` in `sitemap.xml`, mirror resume changes in `llms.txt`, push.

## Photo credits

Background photos are from Unsplash (free to use under the Unsplash License, attribution appreciated). The night peak is by Aleks Dahlberg; add the other photographers' names here if you want to credit them.
