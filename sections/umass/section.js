/* My time at UMass Lowell: opens external card links in a new tab, and reveals the header and cards once on view. */
(() => {
  function init() {
    const root = document.getElementById("umass");
    if (!root || !root.classList.contains("um")) return;

    // Links: any card link with an href to another site opens in a new tab
    root.querySelectorAll(".um-name a[href], .um-cta[href]").forEach((a) => {
      if (a.host && a.host !== location.host) { a.target = "_blank"; a.rel = "noopener"; }
    });

    // Reveal: header, then cards in a short stagger (delays come from --i in CSS). Still under reduced motion.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    const items = root.querySelectorAll(".um-head, .um-card");
    root.classList.add("um-armed");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("um-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
