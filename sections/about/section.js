/* About: swaps the placeholder silhouette for the real cutout once it loads,
   and arms the scroll-in for browsers without CSS scroll timelines. */
(() => {
  function init() {
    const root = document.getElementById("about");
    if (!root || !root.classList.contains("ab")) return;

    // Photo slot: keep the placeholder until img/about/cole-suit-cutout.webp actually loads
    const img = root.querySelector(".ab-photo");
    if (img) {
      const show = () => root.classList.add("ab-has-photo");
      const drop = () => { const pic = img.closest("picture"); (pic || img).remove(); };
      if (img.complete && img.naturalWidth) show();
      else if (img.complete && img.currentSrc) drop();
      else {
        img.addEventListener("load", show, { once: true });
        img.addEventListener("error", drop, { once: true });
      }
    }

    // Scroll-in fallback; CSS handles it alone where animation-timeline is supported
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timelines = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
    const stage = root.querySelector(".ab-stage");
    if (reduce || timelines || !stage || !("IntersectionObserver" in window)) return;
    root.classList.add("ab-armed");
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { root.classList.add("ab-in"); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(stage);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
