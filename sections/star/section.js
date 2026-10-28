/* Chrome star: a 5-armed asterisk with soft, rounded arms in polished metal, drawn with three.js.
   Reflections come from a small procedural studio (dome plus light strips) baked through PMREM;
   the studio turns slowly so highlights slide across the metal, and the star leans toward the pointer.
   three.js loads only when the section is near the viewport; rendering pauses while it is offscreen.
   No WebGL or reduced motion: the still poster in the markup stays. */
(() => {
  const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js";
  const POSTER_POSE = 3.2; // seconds into the motion; the pose the poster image is rendered at

  function init() {
    const root = document.getElementById("star");
    if (!root || !root.classList.contains("st")) return;
    const stage = root.querySelector(".st-stage");
    if (!stage) return;

    // ?st-poster renders one still frame on a transparent background, for making img/star/star-poster.webp
    const posterMode = /[?&]st-poster\b/.test(location.search);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ((reduce && !posterMode) || !hasWebGL()) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      import(THREE_URL).then((THREE) => run(THREE, root, stage, posterMode)).catch((err) => console.warn("[star] staying on the poster:", err));
    };
    if (posterMode || !("IntersectionObserver" in window)) { start(); return; }
    const near = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { near.disconnect(); start(); }
    }, { rootMargin: "600px 0px" });
    near.observe(root);
  }

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  // Outline of a 5-armed asterisk: straight arms with round tips, joined by soft concave fillets
  function starShape(THREE, { arms = 5, len = 1.45, half = 0.12, fillet = 0.56 } = {}) {
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / arms;
    const t0 = half / Math.tan(step / 2); // where neighbouring arm sides meet, measured along the arm
    const corner = half / Math.sin(step / 2); // that meeting point's distance from the center
    const at = (a, t, side) => [Math.cos(a) * t - Math.sin(a) * half * side, Math.sin(a) * t + Math.cos(a) * half * side];
    for (let i = 0; i < arms; i++) {
      const a = Math.PI / 2 + i * step;
      const b = a + step;
      const [sx, sy] = at(a, t0 + fillet, -1);
      if (i === 0) shape.moveTo(sx, sy); // later arms start where the previous fillet ended
      shape.lineTo(...at(a, len, -1));
      shape.absarc(Math.cos(a) * len, Math.sin(a) * len, half, a - Math.PI / 2, a + Math.PI / 2, false);
      shape.lineTo(...at(a, t0 + fillet, 1));
      const mid = a + step / 2;
      shape.quadraticCurveTo(Math.cos(mid) * corner, Math.sin(mid) * corner, ...at(b, t0 + fillet, -1));
    }
    return shape;
  }

  // Weld the bevel and sides so normals average across them and the arms read as one soft surface.
  // The flat caps (ExtrudeGeometry's first group) keep their own vertices, and everything lying in a cap plane
  // points straight out; otherwise the long cap triangles smear bevel normals into a starburst on the mirror finish.
  function smoothGeometry(THREE, geo) {
    const pos = geo.attributes.position;
    const capEnd = geo.groups.length > 1 ? geo.groups[0].count : 0;
    geo.computeBoundingBox();
    const zTop = geo.boundingBox.max.z, zBot = geo.boundingBox.min.z;
    const seen = new Map();
    const verts = [];
    const index = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const key = i < capEnd ? null : `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
      let j = key && seen.get(key);
      if (j === undefined || j === null) { j = verts.length / 3; if (key) seen.set(key, j); verts.push(x, y, z); }
      index.push(j);
    }

    const normals = new Float32Array(verts.length);
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cb = new THREE.Vector3(), ab = new THREE.Vector3();
    for (let f = 0; f < index.length; f += 3) {
      a.fromArray(verts, index[f] * 3); b.fromArray(verts, index[f + 1] * 3); c.fromArray(verts, index[f + 2] * 3);
      cb.subVectors(c, b).cross(ab.subVectors(a, b)); // area weighted
      for (let k = 0; k < 3; k++) {
        const o = index[f + k] * 3;
        normals[o] += cb.x; normals[o + 1] += cb.y; normals[o + 2] += cb.z;
      }
    }
    for (let o = 0; o < normals.length; o += 3) {
      const z = verts[o + 2];
      if (Math.abs(z - zTop) < 1e-5 || Math.abs(z - zBot) < 1e-5) { normals[o] = 0; normals[o + 1] = 0; normals[o + 2] = z > 0 ? 1 : -1; continue; }
      const len = Math.hypot(normals[o], normals[o + 1], normals[o + 2]) || 1;
      normals[o] /= len; normals[o + 1] /= len; normals[o + 2] /= len;
    }

    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    out.setIndex(index);
    geo.dispose();
    return out;
  }

  // A dark studio: near-black dome, a few bright strips. Bright strips become the highlights on the chrome.
  function studio(THREE, renderer) {
    const env = new THREE.Scene();
    const dome = new THREE.SphereGeometry(30, 64, 32);
    const colors = [];
    const p = dome.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 30;
      const v = y > 0 ? 0.007 + 0.04 * Math.pow(y, 1.8) : 0.006 * (1 + y);
      colors.push(v, v, v * 1.04);
    }
    dome.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    env.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

    const strip = (w, h, power, x, y, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
      m.material.color.setScalar(power);
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    strip(10, 0.7, 14, 0, 8, 3);    // long key strip overhead
    strip(0.8, 11, 9, -8, 1, 3);    // tall strip, left
    strip(0.45, 11, 7, 8, 0.5, -2); // thin rim, right
    strip(14, 0.5, 5, 0, 3, -8);    // back rim
    strip(1.8, 1.8, 8, -3, 2, 8);   // small soft box, front left
    strip(3, 0.9, 3, 4, -2, 6);     // low fill, front right

    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(env, 0.03).texture;
    env.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    pmrem.dispose();
    return tex;
  }

  function run(THREE, root, stage, posterMode) {
    const canvas = document.createElement("canvas");
    canvas.className = "st-canvas";
    stage.appendChild(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: posterMode });
    } catch (e) { canvas.remove(); return; }
    const small = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.environment = studio(THREE, renderer);

    const bevel = 0.3;
    let geo = new THREE.ExtrudeGeometry(starShape(THREE), {
      depth: 0.06, bevelEnabled: true, bevelThickness: 0.32, bevelSize: bevel, bevelSegments: 16, curveSegments: 32,
    });
    geo.translate(0, 0, -0.03);
    geo = smoothGeometry(THREE, geo);
    const radius = 1.45 + 0.12 + bevel; // tip center + arm half width + bevel

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xc9ccd2, metalness: 1, roughness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.05, envMapIntensity: 1.3,
    });
    const star = new THREE.Mesh(geo, material);
    const tilt = new THREE.Group(); // pointer lean lives here, the slow sway on the star itself
    tilt.add(star);
    scene.add(tilt);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const frame = () => {
      const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      const aspect = w / h;
      // Star center sits 62% down the frame; the bottom arms run into the fade below
      const viewH = Math.max(radius * 2.55, (radius * 2.5) / aspect);
      const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.aspect = aspect;
      camera.position.set(0, viewH * 0.12, dist);
      camera.lookAt(0, viewH * 0.12, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    frame();

    const pose = (t, lean) => {
      scene.environmentRotation.y = t * 0.22;
      scene.environmentRotation.x = Math.sin(t * 0.13) * 0.25;
      star.rotation.set(-0.16 + Math.sin(t * 0.31) * 0.12, Math.sin(t * 0.23) * 0.42, Math.sin(t * 0.11) * 0.08);
      tilt.rotation.set(lean.y * 0.16, lean.x * 0.22, 0);
    };

    if (posterMode) {
      pose(POSTER_POSE, { x: 0, y: 0 });
      renderer.render(scene, camera);
      root.classList.add("st-live");
      document.documentElement.dataset.stPosterReady = "1";
      return;
    }

    // Pointer lean, eased
    const target = { x: 0, y: 0 }, lean = { x: 0, y: 0 };
    const onPointer = (e) => {
      const r = stage.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = false, raf = 0, last = 0, t = POSTER_POSE, shown = false;
    const tick = (now) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      t += dt;
      const k = 1 - Math.exp(-dt * 3);
      lean.x += (target.x - lean.x) * k;
      lean.y += (target.y - lean.y) * k;
      pose(t, lean);
      renderer.render(scene, camera);
      if (!shown) { shown = true; root.classList.add("st-live"); }
      loop();
    };
    const loop = () => { if (visible && !document.hidden && !raf) raf = requestAnimationFrame(tick); };
    const pause = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };

    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) loop(); else pause();
    }).observe(stage);
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else loop(); });
    if ("ResizeObserver" in window) new ResizeObserver(() => { frame(); if (!raf && shown) renderer.render(scene, camera); }).observe(stage);
    else window.addEventListener("resize", frame);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
