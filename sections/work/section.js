/* Skills and side projects (prefix wk-): hover swap, touch auto-cycle, showcase drift. */
(function () {
  function init() {
    var root = document.getElementById('work');
    if (!root || !root.classList.contains('wk')) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var touch = window.matchMedia('(hover: none)');
    var hasIO = 'IntersectionObserver' in window;

    /* ---- Hover swap ---- */
    var tiles = Array.prototype.slice.call(root.querySelectorAll('[data-wk-swap]'));
    function origin(media, x, y) {
      media.style.setProperty('--wk-x', x);
      media.style.setProperty('--wk-y', y);
    }
    function setB(tile, on) {
      tile.classList.toggle('is-b', on);
      tile.querySelector('.wk-swap').setAttribute('aria-pressed', String(on));
    }
    tiles.forEach(function (tile) {
      var media = tile.querySelector('.wk-media');
      var btn = tile.querySelector('.wk-swap');
      // The circle grows from wherever the pointer enters and follows it while it moves.
      function track(e) {
        var r = media.getBoundingClientRect();
        origin(media, ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }
      tile.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') track(e); });
      media.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') track(e); });
      tile.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') track(e); });
      tile.addEventListener('focusin', function () { origin(media, '50%', '50%'); });
      btn.addEventListener('click', function (e) {
        if (e.detail) track(e); else origin(media, '50%', '50%');
        tile.dataset.wkTouched = '1';
        setB(tile, !tile.classList.contains('is-b'));
      });
    });

    // Phones have no hover: cycle each tile on its own while it is on screen, until someone taps it.
    if (hasIO) {
      var timers = new Map();
      var cycleIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var tile = en.target;
          clearInterval(timers.get(tile));
          if (!en.isIntersecting || !touch.matches || reduce.matches) return;
          var i = tiles.indexOf(tile);
          timers.set(tile, setInterval(function () {
            if (tile.dataset.wkTouched) return;
            var on = !tile.classList.contains('is-b');
            origin(tile.querySelector('.wk-media'), on ? '88%' : '12%', on ? '86%' : '14%');
            setB(tile, on);
          }, 3400 + (i % 3) * 500));
        });
      }, { threshold: 0.35 });
      tiles.forEach(function (t) { cycleIO.observe(t); });
    }

    /* ---- Showcase ---- */
    var show = root.querySelector('[data-wk-show]');
    if (show) {
      // Three copies of each column's set, so the drift loops with no seam.
      show.querySelectorAll('.wk-track').forEach(function (track) {
        var set = track.querySelector('.wk-set');
        for (var k = 0; k < 2; k++) track.appendChild(set.cloneNode(true));
      });
      show.classList.add('is-live');
      if (hasIO) {
        new IntersectionObserver(function (entries) {
          show.classList.toggle('is-off', !entries[0].isIntersecting);
        }).observe(show);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
