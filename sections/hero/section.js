/* Hero (prefix hx-): pauses the wheel while the hero is off screen. */
(() => {
  const init = () => {
    const root = document.querySelector('.hx');
    if (!root) return;

    // Stop turning the wheel when nobody can see it
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => root.classList.toggle('hx-off', !e.isIntersecting)).observe(root);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
