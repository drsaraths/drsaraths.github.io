/* Mixed-pixel demonstration.
   A made-up leaf scene is drawn at fine resolution, then averaged into a coarse
   "sensor" grid. Cells that straddle two surfaces read a blended temperature.
   Nothing here comes from the papers; it only shows the idea. */
(() => {
  const canvas = document.getElementById("thermal");
  if (!canvas) return;

  const W = 48, H = 32;      // sensor pixels
  const S = 4;               // fine samples per sensor pixel, per side
  const CELL = 10;           // canvas pixels per sensor pixel
  const T_MIN = 27, T_MAX = 38;
  const PURE = 0.9;          // dominant share needed for a "pure" pixel
  const NAMES = ["soil", "leaf", "lesion"];

  const ctx = canvas.getContext("2d");
  canvas.width = W * CELL;
  canvas.height = H * CELL;

  const readout = document.getElementById("thermal-readout");
  const buttons = [...document.querySelectorAll("[data-mode]")];

  // Seeded noise so the scene looks the same on every visit.
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = rng(11);

  // Colour ramp (dark to hot), built into a lookup table.
  const stops = [
    [0.00, [0, 0, 4]], [0.18, [45, 17, 96]], [0.36, [114, 31, 129]],
    [0.55, [181, 54, 122]], [0.72, [241, 96, 93]], [0.86, [254, 175, 119]], [1.00, [252, 253, 191]]
  ];
  const lut = [];
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, c0] = stops[k], [t1, c1] = stops[k + 1];
    const f = (t - t0) / (t1 - t0);
    lut.push(`rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * f)).join(",")})`);
  }
  const colour = (temp) => lut[Math.max(0, Math.min(255, Math.round(((temp - T_MIN) / (T_MAX - T_MIN)) * 255)))];

  // Scene: a tilted leaf with two lesions on warmer soil.
  const ang = -0.38, cosA = Math.cos(ang), sinA = Math.sin(ang);
  const cx = 24, cy = 16.5, L = 20, Wmax = 9;
  const lesions = [[0.12, 0.28, 2.5], [-0.38, -0.32, 1.9], [0.52, 0.08, 1.5]];

  // Distance from the midrib, used to draw a slightly warmer central vein.
  function veinQ(x, y) {
    return -(x - cx) * sinA + (y - cy) * cosA;
  }

  function classify(x, y) {
    const dx = x - cx, dy = y - cy;
    const p = dx * cosA + dy * sinA;
    const q = -dx * sinA + dy * cosA;
    const t = p / L;
    if (t < -1 || t > 1) return 0;
    const d = t < -0.2 ? 0.8 : 1.2;
    const w = Wmax * Math.pow(Math.max(0, 1 - Math.pow((t + 0.2) / d, 2)), 0.85);
    if (Math.abs(q) > w) return 0;
    for (const [lp, lq, r] of lesions) {
      const ex = p - lp * L, ey = q - lq * Wmax;
      const wobble = 1 + 0.18 * Math.sin(Math.atan2(ey, ex) * 3);
      if (Math.hypot(ex, ey) < r * wobble) return 2;
    }
    return 1;
  }

  const base = [36.4, 30.2, 33.6];
  const cells = [];
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const share = [0, 0, 0];
      let sum = 0;
      for (let b = 0; b < S; b++) {
        for (let a = 0; a < S; a++) {
          const x = i + (a + 0.5) / S, y = j + (b + 0.5) / S;
          const k = classify(x, y);
          share[k]++;
          const drift = k === 0 ? (x / W) * 0.9 : k === 1 ? (x / W) * 0.6 : 0;
          const vein = k === 1 ? 0.9 * Math.exp(-Math.pow(veinQ(x, y) / 0.7, 2)) : 0;
          sum += base[k] + drift + vein + (rand() - 0.5) * 0.5;
        }
      }
      const n = S * S;
      const f = share.map((v) => v / n);
      const dom = f.indexOf(Math.max(...f));
      cells.push({ i, j, raw: sum / n, f, dom, mixed: f[dom] < PURE, fixed: null });
    }
  }
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H ? null : cells[j * W + i]);

  // Local correction: replace a mixed pixel with the median of nearby pure pixels of its dominant surface.
  for (const c of cells) {
    if (!c.mixed) { c.fixed = c.raw; continue; }
    const near = [];
    for (let dj = -2; dj <= 2; dj++) {
      for (let di = -2; di <= 2; di++) {
        const n = at(c.i + di, c.j + dj);
        if (n && !n.mixed && n.dom === c.dom) near.push(n.raw);
      }
    }
    near.sort((a, b) => a - b);
    c.fixed = near.length ? near[Math.floor(near.length / 2)] : base[c.dom];
  }

  let mode = "mixed";
  let hover = null;
  let rows = H;

  const value = (c) => (mode === "corrected" ? c.fixed : c.raw);

  function draw() {
    for (const c of cells) {
      if (c.j >= rows) {
        ctx.fillStyle = "#000";
      } else {
        ctx.fillStyle = colour(value(c));
      }
      ctx.fillRect(c.i * CELL, c.j * CELL, CELL, CELL);
    }
    if (mode === "mixed") {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#e6b95a";
      for (const c of cells) {
        if (c.mixed && c.j < rows) ctx.strokeRect(c.i * CELL + 1, c.j * CELL + 1, CELL - 2, CELL - 2);
      }
    }
    if (hover) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(hover.i * CELL + 1, hover.j * CELL + 1, CELL - 2, CELL - 2);
    }
  }

  const pct = (v) => Math.round(v * 100) + "%";
  const deg = (v) => v.toFixed(1) + " °C";

  function describe() {
    if (!readout) return;
    if (!hover) {
      readout.textContent = "Move over the image to read a single pixel.";
      return;
    }
    const c = hover;
    const where = "Pixel " + (c.i + 1) + ", " + (c.j + 1);
    if (!c.mixed) {
      readout.textContent = where + " reads " + deg(c.raw) + ". It sees only " + NAMES[c.dom] + ".";
      return;
    }
    const parts = c.f.map((v, k) => [v, k]).filter(([v]) => v > 0).sort((a, b) => b[0] - a[0])
      .map(([v, k]) => pct(v) + " " + NAMES[k]);
    if (mode === "corrected") {
      readout.textContent = where + " read " + deg(c.raw) + " because it held " + parts.join(" and ") +
        ". The correction sets it to " + deg(c.fixed) + ", the median of nearby pure " + NAMES[c.dom] + " pixels.";
    } else {
      readout.textContent = where + " reads " + deg(c.raw) + ". It holds " + parts.join(" and ") +
        ", so the value belongs to neither surface.";
    }
  }

  function setMode(m) {
    mode = m;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    draw();
    describe();
  }
  buttons.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  function pick(evt) {
    const r = canvas.getBoundingClientRect();
    const i = Math.floor(((evt.clientX - r.left) / r.width) * W);
    const j = Math.floor(((evt.clientY - r.top) / r.height) * H);
    hover = at(i, j);
    draw();
    describe();
  }
  canvas.addEventListener("pointermove", pick);
  canvas.addEventListener("pointerdown", pick);
  canvas.addEventListener("pointerleave", () => { hover = null; draw(); describe(); });

  // Keyboard access: arrow keys move the inspected pixel.
  canvas.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!step) return;
    e.preventDefault();
    const from = hover || at(Math.floor(W / 2), Math.floor(H / 2));
    hover = at(Math.max(0, Math.min(W - 1, from.i + step[0])), Math.max(0, Math.min(H - 1, from.j + step[1])));
    draw();
    describe();
  });

  // One entrance: the frame reads out row by row, like a sensor.
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    draw(); describe();
  } else {
    rows = 0;
    const start = performance.now();
    const total = 1100;
    const tick = (now) => {
      rows = Math.min(H, Math.floor(((now - start) / total) * H));
      draw();
      if (rows < H) requestAnimationFrame(tick);
      else describe();
    };
    describe();
    requestAnimationFrame(tick);
  }
})();
