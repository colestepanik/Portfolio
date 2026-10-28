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
    var brain = root.querySelector('[data-wk-graph]');
    var graph = brain ? makeGraph(brain, reduce, hasIO) : null;
    function setB(tile, on) {
      tile.classList.toggle('is-b', on);
      tile.querySelector('.wk-swap').setAttribute('aria-pressed', String(on));
      if (graph && tile === graph.tile) graph.update();
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
    // The graph tile holds its graph longer, so the build has time to finish and turn.
    if (hasIO) {
      var timers = new Map();
      var cycleIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var tile = en.target;
          clearTimeout(timers.get(tile));
          if (!en.isIntersecting || !touch.matches || reduce.matches) return;
          var base = 3400 + (tiles.indexOf(tile) % 3) * 500;
          function step() {
            if (tile.dataset.wkTouched) return;
            var on = !tile.classList.contains('is-b');
            origin(tile.querySelector('.wk-media'), on ? '88%' : '12%', on ? '86%' : '14%');
            setB(tile, on);
            timers.set(tile, setTimeout(step, graph && tile === graph.tile && on ? 9000 : base));
          }
          timers.set(tile, setTimeout(step, base));
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

  /* ---- 2nd Brain: an Obsidian style graph view that builds itself in 3D ----
     Canvas 2D with a hand rolled perspective projection (no WebGL, so it never competes with the star).
     Shown while the tile is hovered, keyboard focused or toggled; replaces the second image. */
  function makeGraph(tile, reduce, hasIO) {
    var media = tile.querySelector('.wk-media');
    var btn = tile.querySelector('.wk-swap');
    var cv = document.createElement('canvas');
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return null; // no canvas: the image swap keeps working
    cv.className = 'wk-graph';
    cv.setAttribute('aria-hidden', 'true');
    media.insertBefore(cv, btn);
    tile.classList.add('wk-has-graph');
    btn.setAttribute('aria-label', 'Show the vault graph for 2nd Brain');

    /* Graph: seeded, so it is the same vault every time. Each node links only to older nodes,
       which makes the build order valid by construction. */
    var seed = 11;
    function rnd() { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; }
    function pick(list) { return list[Math.floor(rnd() * list.length)]; }
    var LABELS = ['Daily log', 'Projects', 'Ownerhound', 'CCR', 'Recruiting', 'People', 'Skills'];
    var HUB_AT = [0, 3, 8, 14, 21, 29, 38];
    var N = 58, nodes = [], edges = [], hubs = [], lastHub;
    for (var i = 0; i < N; i++) {
      var h = HUB_AT.indexOf(i), n = { i: i, hub: h >= 0, label: h >= 0 ? LABELS[h] : null, deg: 0, p: null };
      if (i) {
        n.p = n.hub ? pick(hubs) : rnd() < .55 ? lastHub : rnd() < .6 ? pick(hubs) : pick(nodes);
        var u = rnd() * 2 - 1, th = rnd() * 6.283, s = Math.sqrt(1 - u * u), d = n.hub ? .6 : .22 + rnd() * .12;
        n.x = n.p.x + s * Math.cos(th) * d; n.y = n.p.y + u * d; n.z = n.p.z + s * Math.sin(th) * d;
        edges.push({ a: n.p, b: n, extra: false });
        // Some notes also link sideways to a nearby older note, like real backlinks.
        for (var k = rnd() < .38 ? (rnd() < .25 ? 2 : 1) : 0; k > 0; k--) {
          var m = pick(nodes);
          if (m !== n.p && Math.hypot(m.x - n.x, m.y - n.y, m.z - n.z) < .9) edges.push({ a: m, b: n, extra: true });
        }
      } else { n.x = n.y = n.z = 0; }
      if (n.hub) { hubs.push(n); lastHub = n; }
      nodes.push(n);
    }
    edges.forEach(function (e) { e.a.deg++; e.b.deg++; });

    // Settle the layout once with a small force simulation: repel all, spring the links, pull to center.
    for (var it = 0; it < 260; it++) {
      var cool = 1 - it / 260;
      nodes.forEach(function (a) { a.vx = -a.x * .01; a.vy = -a.y * .01; a.vz = -a.z * .01; });
      for (var p = 0; p < N; p++) for (var q = p + 1; q < N; q++) {
        var A = nodes[p], B = nodes[q], dx = A.x - B.x, dy = A.y - B.y, dz = A.z - B.z, dd = dx * dx + dy * dy + dz * dz + .002, f = .0016 / dd;
        A.vx += dx * f; A.vy += dy * f; A.vz += dz * f; B.vx -= dx * f; B.vy -= dy * f; B.vz -= dz * f;
      }
      edges.forEach(function (e) {
        var dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, dz = e.b.z - e.a.z, len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        var rest = e.a.hub && e.b.hub ? .62 : .24, f = (len - rest) / len * .08;
        e.a.vx += dx * f; e.a.vy += dy * f; e.a.vz += dz * f; e.b.vx -= dx * f; e.b.vy -= dy * f; e.b.vz -= dz * f;
      });
      nodes.forEach(function (a) { a.x += a.vx * cool; a.y += a.vy * cool; a.z += a.vz * cool; });
    }
    var cx0 = 0, cy0 = 0, cz0 = 0, rad = 0;
    nodes.forEach(function (a) { cx0 += a.x / N; cy0 += a.y / N; cz0 += a.z / N; });
    nodes.forEach(function (a) { a.x -= cx0; a.y -= cy0; a.z -= cz0; rad = Math.max(rad, Math.hypot(a.x, a.y, a.z)); });

    // Reveal schedule: slow first few, quicker as the vault fills. Node size follows link count, like Obsidian.
    var BUILD = 4.8, POP = .35, GROW = .45, SLIDE = .7, END = BUILD + 1.6;
    nodes.forEach(function (a) {
      a.x /= rad; a.y /= rad * 1.3; a.z /= rad; // flatter than tall, to suit the 16:10 frame
      a.t0 = .15 + BUILD * Math.pow(a.i / (N - 1), .75);
      a.r = Math.min(7, 1.6 + Math.sqrt(a.deg) * (a.hub ? 1.6 : 1.05));
    });
    edges.forEach(function (e) { e.t0 = e.b.t0 + (e.extra ? .2 : 0); });

    /* Drawing */
    var W = 0, H = 0, dpr = 1, font = '';
    var GREY = [168, 168, 178], NODE = [206, 206, 212], ACC = [127, 109, 242];
    function size() {
      var r = media.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      font = '500 ' + (W < 480 ? 10 : 11) + 'px ' + getComputedStyle(tile).fontFamily;
    }
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function out(v) { return 1 - Math.pow(1 - v, 3); }
    function back(v) { var c = 1.9; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); }
    function mix(c1, c2, k, al) {
      return 'rgba(' + Math.round(c1[0] + (c2[0] - c1[0]) * k) + ',' + Math.round(c1[1] + (c2[1] - c1[1]) * k) + ',' + Math.round(c1[2] + (c2[2] - c1[2]) * k) + ',' + al.toFixed(3) + ')';
    }
    // How purple something still is: full when it appears, grey again about a second and a half later.
    function fresh(t, t0) { return 1 - clamp((t - t0 - .25) / 1.3); }

    function draw(t, yaw) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var S = Math.min(W, H * 1.5) * .38, cx = W / 2, cy = H / 2, F = 3.2;
      var cy_ = Math.cos(yaw), sy = Math.sin(yaw), cb = Math.cos(.34), sb = Math.sin(.34);
      var shown = [];
      for (var i = 0; i < N; i++) {
        var a = nodes[i];
        if (t < a.t0) break;
        // A new note slides out of the note it links to, so its first link grows with it.
        var m = a.p ? out(clamp((t - a.t0) / SLIDE)) : 1, x = a.x, y = a.y, z = a.z;
        if (a.p) { x = a.p.wx + (x - a.p.wx) * m; y = a.p.wy + (y - a.p.wy) * m; z = a.p.wz + (z - a.p.wz) * m; }
        a.wx = x; a.wy = y; a.wz = z;
        var x1 = x * cy_ + z * sy, z1 = -x * sy + z * cy_;
        var y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb, k = F / (F + z2);
        a.sx = cx + x1 * S * k; a.sy = cy + y1 * S * k; a.k = k;
        a.near = clamp((1 - z2) / 2); // 1 nearest the viewer, 0 at the back
        shown.push(a);
      }
      ctx.lineCap = 'round';
      edges.forEach(function (e) {
        if (t < e.t0 || !e.a.k || t < e.b.t0) return;
        var g = e.extra ? out(clamp((t - e.t0) / GROW)) : 1, fr = fresh(t, e.t0), near = (e.a.near + e.b.near) / 2;
        var from = e.extra ? e.b : e.a, to = e.extra ? e.a : e.b;
        ctx.strokeStyle = mix(GREY, ACC, fr, .1 + .22 * near + .45 * fr);
        ctx.lineWidth = (.6 + .5 * near) + fr * .6;
        ctx.beginPath();
        ctx.moveTo(from.sx, from.sy);
        ctx.lineTo(from.sx + (to.sx - from.sx) * g, from.sy + (to.sy - from.sy) * g);
        ctx.stroke();
      });
      shown.sort(function (p, q) { return p.near - q.near; }); // back to front
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      shown.forEach(function (a) {
        var s = back(clamp((t - a.t0) / POP)), fr = fresh(t, a.t0), al = .35 + .65 * a.near;
        var r = Math.max(.1, a.r * a.k * (.7 + .4 * a.near) * s);
        if (fr > 0) {
          ctx.fillStyle = mix(ACC, ACC, 0, .22 * fr);
          ctx.beginPath(); ctx.arc(a.sx, a.sy, r * 2.6, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = mix(NODE, ACC, fr, al * (a.hub ? 1 : .85));
        ctx.beginPath(); ctx.arc(a.sx, a.sy, r, 0, 6.283); ctx.fill();
        if (a.label && W >= 300) {
          ctx.fillStyle = mix(NODE, ACC, fr, al * .75 * clamp((t - a.t0 - .2) / .5));
          ctx.fillText(a.label, a.sx, a.sy + r + 5);
        }
      });
    }

    /* State: rebuild when it comes back after a pause at the end; resume if the mouse left mid build. */
    var hovered = false, focused = false, active = false, visible = !hasIO;
    var t = 0, yaw = .6, raf = 0, last = 0, leftAt = -1e9, SPIN = .2, FADE = 700;
    function frame(now) {
      var dt = Math.min(.05, (now - last) / 1000);
      last = now;
      if (active) t = Math.min(t + dt, END);
      yaw += dt * SPIN;
      draw(t, yaw);
      raf = (active || now - leftAt < FADE) && visible ? requestAnimationFrame(frame) : 0;
    }
    function run() {
      if (reduce.matches) { draw(END, .6); return; } // one finished, still frame
      if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    function update() {
      var on = hovered || focused || tile.classList.contains('is-b'), now = performance.now();
      if (on === active) return;
      active = on;
      tile.classList.toggle('is-graph', on);
      if (on) {
        if (t >= END && now - leftAt > 1500) t = 0;
        if (!W) size();
        run();
      } else leftAt = now;
    }

    tile.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovered = true; update(); } });
    tile.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovered = false; update(); } });
    tile.addEventListener('focusin', function (e) {
      try { focused = e.target.matches(':focus-visible'); } catch (err) { focused = true; }
      update();
    });
    tile.addEventListener('focusout', function () { focused = false; update(); });
    if (hasIO) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && active) run();
      }).observe(tile);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { if (!W) return; size(); if (active) { if (reduce.matches) draw(END, .6); else draw(t, yaw); } }).observe(media);
    }
    return { tile: tile, update: update };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
