/* Hero (prefix hx-): pauses the band while the hero is off screen, and tells the fixed nav when it sits over the light part. */
(() => {
  const init = () => {
    const root = document.querySelector('.hx');
    if (!root || !('IntersectionObserver' in window)) return;

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
