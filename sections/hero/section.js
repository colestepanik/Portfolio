/* Hero (prefix hx-): types the name and the lines under it, pauses the band while the hero is off screen,
   shades the band as you scroll, and tells the fixed nav when it sits over the light part. */
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---- Typing ----
     An underscore caret types the name and stays blinking after the k. The lede, "Let's talk" and the email then
     fade in as one wave sweeping toward the bottom right.
     Every character is a span that keeps its place while hidden, so the layout never moves.
     Screen readers get each line once, from a visually hidden copy; the typed copy is aria-hidden. */
  let run = 0, snapshot = null;

  function split(el) {
    const full = el.textContent;
    const sr = document.createElement('span');
    sr.className = 'hx-sr'; sr.textContent = full;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    while (el.firstChild) vis.appendChild(el.firstChild);
    el.append(sr, vis);
    const walker = document.createTreeWalker(vis, NodeFilter.SHOW_TEXT);
    const texts = []; for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n);
    const out = [];
    texts.forEach((node) => {
      const frag = document.createDocumentFragment();
      Array.from(node.data).forEach((p) => {
        const s = document.createElement('span');
        s.className = 'hx-ch'; s.textContent = p; frag.appendChild(s); out.push(s);
      });
      node.replaceWith(frag);
    });
    return out;
  }

  async function type(id, items, caret, base, jitter, pauseOnSpace) {
    for (const c of items) {
      if (id !== run) return false;
      c.classList.add('on');
      if (caret) c.after(caret);
      const space = c.textContent === ' ';
      await sleep(base + Math.random() * jitter + (space ? pauseOnSpace : 0));
    }
    return id === run;
  }

  async function play(root) {
    const id = ++run;
    const inner = root.querySelector('.hx-inner');
    if (snapshot === null) snapshot = inner.innerHTML; else inner.innerHTML = snapshot;
    const name = root.querySelector('.hx-name'), lede = root.querySelector('.hx-lede');
    const talk = root.querySelector('.hx-talk-k'), mail = root.querySelector('.hx-mail');
    const n = split(name), l = split(lede), k = split(talk), m = split(mail);
    const caret = document.createElement('span');
    caret.className = 'hx-caret'; caret.setAttribute('aria-hidden', 'true');
    n[0].before(caret); // inside "Cole", so it never sits on a line of its own on phones
    root.classList.add('hx-typing'); root.classList.remove('hx-will-type');

    // Timings are about 60% of the first draft (Cole: "about 50% faster")
    await sleep(240);
    if (!(await type(id, n, caret, 42, 33, 85))) return;
    caret.classList.add('idle');
    await sleep(160);
    if (id !== run) return;

    // The lines below come in as one wave toward the bottom right: each character fades in when a diagonal
    // front reaches it (left to right counts a bit more than top to bottom).
    const box = root.querySelector('.hx-sub').getBoundingClientRect();
    const WAVE = 900;
    [...l, ...k, ...m].forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = .58 * (r.left - box.left) / (box.width || 1) + .42 * (r.top - box.top) / (box.height || 1);
      setTimeout(() => { if (id === run) c.classList.add('on'); }, d * WAVE);
    });
  }

  const init = () => {
    const root = document.querySelector('.hx');
    if (!root) return;

    if (!reduce && root.querySelector('.hx-name')) {
      const go = () => play(root);
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go, go);
    }

    // Shade under the photo band: 0 at the top of the page, 1 once you've scrolled 60% of the hero
    if (!reduce) {
      let raf = 0;
      const shade = () => {
        raf = 0;
        const p = Math.min(1, Math.max(0, window.scrollY / (root.offsetHeight * 0.6 || 1)));
        root.style.setProperty('--hx-p', p.toFixed(3));
      };
      window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(shade); }, { passive: true });
      shade();
    }

    if (!('IntersectionObserver' in window)) return;

    // Stop the marquee when nobody can see it
    new IntersectionObserver(([e]) => root.classList.toggle('hx-off', !e.isIntersecting)).observe(root);

    // The nav is dark ink while the light concrete is under it, and goes back to the dark site style
    // once the black band reaches it. The root margin leaves only a strip the height of the nav at the top.
    const nav = document.getElementById('nav');
    const light = root.querySelector('.hx-inner');
    if (!nav || !light) return;
    let io;
    const watch = () => {
      if (io) io.disconnect();
      const h = nav.offsetHeight || 68;
      io = new IntersectionObserver(([e]) => nav.classList.toggle('nav-on-light', e.isIntersecting),
        { rootMargin: `0px 0px ${h - window.innerHeight}px 0px` });
      io.observe(light);
    };
    watch();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(watch, 150); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
