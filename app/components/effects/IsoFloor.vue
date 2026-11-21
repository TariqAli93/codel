<script lang="ts">
import {
  FRAG,
  UNIFORMS,
  VERT,
  look,
  type UniformName,
} from "./isoFloorShaders";

// The floor under the opening's stack (HomeLayers): an isometric grid on the plates' own axes, four
// cells to a plate edge, with a lime patch beside the stack.
//
// Two drawings of the same floor share the geometry below and the mesh's own numbers for its look
// (isoFloorShaders), so at rest they are the same picture and one takes over from the other unseen:
// - a static grid, a few SVG paths, rendered on the server. It is the floor without JavaScript, on
//   touch screens, under reduced motion, without WebGL 2, and whenever the mesh is not drawing;
// - a mesh, drawn in WebGL over it, for a mouse and motion allowed: the same grid as a surface.
//   Flat at rest; astir (for a few seconds after the first paint, and while the hero is live) it
//   has a very low swell, a mound at the patch and a few crossings glowing; and a shallow mound
//   rises under the pointer.

// ---------------------------------------------------------------------------
// Geometry: everything from the box alone
// ---------------------------------------------------------------------------

// The parent places the box from the stack (the .hero__floor rules in HomeIntro.vue; keep these
// three in step with them):
// - SPAN: the box is this many stack widths wide and centred on the stack
//   (inset-inline: stack width x -1.6, so 1.6 + 1 + 1.6);
// - FOOT: the stack's foot, the bottom of its last plate, in box widths down from the box's top
//   (inset-block-start: 52%, so 0.48 of the stack's height, 2.28 stack widths, over SPAN);
// - GAP: the ground lies this many stack widths under the foot. The ground's origin, one of the
//   grid's crossings, is straight under the foot.
const SPAN = 4.2;
const FOOT = 0.2605;
const GAP = 0.065;
// A cell's edge on the ground, in stack widths: across the screen it covers an eighth of a plate's
// width, so four cells make a plate's edge.
const CELL = 0.14434;
const COS30 = Math.sqrt(3) / 2;
const SIN30 = 0.5;
// The lime patch's centre, in stack widths from the ground's origin: toward the end side of the
// stack (a little past the stack's own edge, so it stays in the window when the stack sits near
// the window's edge), level with the foot.
const PATCH = { x: -0.55, y: -GAP };

// Screen (from the ground's origin, y down) to ground (cells), for a point on the flat ground.
function toGround(x: number, y: number, cell: number): [number, number] {
  const a = y / (cell * SIN30);
  const b = x / (cell * COS30);
  return [0.5 * (a + b), 0.5 * (a - b)];
}

// ---------------------------------------------------------------------------
// The static grid, in the stack's own drawing units (a plate is 308 across)
// ---------------------------------------------------------------------------

const UNIT = 308;
const WIDTH = SPAN * UNIT;
const HEIGHT = 900;
const origin = { x: WIDTH / 2, y: FOOT * WIDTH + GAP * UNIT };
// A cell on screen: a rhombus this wide and this tall, its lines parallel to the plates' edges.
const cellBox = { w: 2 * CELL * COS30 * UNIT, h: 2 * CELL * SIN30 * UNIT };
const patch = { cx: origin.x + PATCH.x * UNIT, cy: origin.y + PATCH.y * UNIT };

const round = (value: number) => Math.round(value * 100) / 100;

// The patch's lime and its haze fall away from its centre as bells, the ones the mesh draws: round
// on the ground, so an ellipse on screen. A radial gradient stands in for each: these stops, out to
// CUT sigmas, where the bell is taken as nothing.
const CUT = 2.6;
const bellStops = [0, 0.2, 0.4, 0.6, 0.8, 1].map((offset) => ({
  offset,
  value:
    offset === 1
      ? 0
      : Math.round(Math.exp(-((offset * CUT) ** 2) / 2) * 1000) / 1000,
}));
// The ellipse a bell of that many cells covers on screen, as a gradient's own space (a unit circle
// moved to the patch and stretched to it).
const bellSpace = (sigma: number) =>
  `translate(${round(patch.cx)} ${round(patch.cy)}) scale(${round(
    CUT * sigma * (cellBox.w / 2) * Math.SQRT2,
  )} ${round(CUT * sigma * (cellBox.h / 2) * Math.SQRT2)})`;
const litSpace = bellSpace(look.litSigma);
const hazeSpace = bellSpace(look.hazeSigma);

// Every line of both directions, cut to the plane: y = origin.y ± slope (x - origin.x) + k cells,
// for every k that crosses it.
function gridLines() {
  const slope = cellBox.h / cellBox.w;
  const reach = Math.ceil((HEIGHT + WIDTH * slope) / cellBox.h) + 1;
  const segments: string[] = [];
  for (const lean of [slope, -slope]) {
    for (let k = -reach; k <= reach; k += 1) {
      const y = (x: number) => origin.y + lean * (x - origin.x) + k * cellBox.h;
      const x = (at: number) => origin.x + (at - origin.y - k * cellBox.h) / lean;
      const from = Math.max(0, Math.min(x(0), x(HEIGHT)));
      const to = Math.min(WIDTH, Math.max(x(0), x(HEIGHT)));
      if (to - from < 1) continue;
      segments.push(
        `M${round(from)},${round(y(from))}L${round(to)},${round(y(to))}`,
      );
    }
  }
  return segments.join("");
}

// The crossings the patch lights, each a dot (a line of next to no length with round ends): every
// crossing within the bell's reach of the patch's centre.
function patchNodes() {
  const [centreX, centreY] = toGround(PATCH.x * UNIT, PATCH.y * UNIT, CELL * UNIT);
  const reach = CUT * look.litSigma;
  const dots: string[] = [];
  for (let i = Math.floor(centreX - reach); i <= Math.ceil(centreX + reach); i += 1) {
    for (let j = Math.floor(centreY - reach); j <= Math.ceil(centreY + reach); j += 1) {
      if (Math.hypot(i - centreX, j - centreY) > reach) continue;
      const x = origin.x + ((i - j) * cellBox.w) / 2;
      const y = origin.y + ((i + j) * cellBox.h) / 2;
      dots.push(`M${round(x)},${round(y)}h0.01`);
    }
  }
  return dots.join("");
}

const lines = gridLines();
const nodes = patchNodes();
const viewBox = `0 0 ${round(WIDTH)} ${HEIGHT}`;

// ---------------------------------------------------------------------------
// The mesh
// ---------------------------------------------------------------------------

// Where there is a mesh at all: a hovering, fine pointer and motion allowed (the query the layout
// uses for smooth scrolling). Anywhere else no context is ever made.
const meshQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// The drawing buffer: the box's size times the screen's density (two at most), never more than
// this many pixels. If frames come slowly it steps down this ladder, and stays down for the visit
// (the step is kept here, outside any one mount).
const PIXEL_BUDGET = 2_200_000;
const LADDER = [1, 0.75, 0.6];
const SLOW_FRAME_MS = 24;
const FRAME_SAMPLE = 30;
let ladderStep = 0;

// The part of the box the root's mask leaves anything in, in box widths (the mask in the styles
// below; keep in step): nothing is drawn outside it.
const SHOWN = { right: 0.84, top: 0.0278, bottom: 0.325 };

// Timings, in seconds: the mesh's fade-in from its first frame (the static grid fades out over the
// same time, in the styles); how fast the floor comes astir and settles again; how the pointer's
// mound follows, rises and sinks.
const REVEAL_S = 0.6;
const GAIN_S = 0.35;
// The floor is astir by itself until this long after the first paint, settling included: frames
// measure it, not a timer, so nothing late can carry it on. Motion that started by itself is over
// well within five seconds.
const AUTO_S = 4.2;
const FOLLOW_S = 0.12;
const RISE_S = 0.18;
const SINK_S = 0.3;
// The mound is up while the pointer is in the box grown by this many stack widths.
const REACH = 0.5;

type Rgb = [number, number, number];

// A token's colour, read from an element styled with it: "rgb(196, 245, 39)" or
// "color(srgb 0.77 0.96 0.15)", to 0..1.
function readColor(element: Element | null): Rgb | null {
  if (!element) return null;
  const value = getComputedStyle(element).color;
  const parts = value.match(/-?\d*\.?\d+%?/g);
  if (!parts || parts.length < 3) return null;
  const full = value.startsWith("color(") ? 1 : 255;
  const channel = (part: string | undefined) =>
    part === undefined
      ? 0
      : part.endsWith("%")
        ? parseFloat(part) / 100
        : parseFloat(part) / full;
  return [channel(parts[0]), channel(parts[1]), channel(parts[2])];
}

interface MeshOptions {
  surface: HTMLCanvasElement;
  // The floor's box: measured for the geometry, watched for its size and for being on screen.
  box: HTMLElement;
  // Elements that carry the two tokens as their colour.
  line: Element | null;
  accent: Element | null;
  // Whether the floor should be astir now.
  astir: () => boolean;
  // Told when the mesh starts drawing, and when it stops being the floor (a lost context).
  drawn: (on: boolean) => void;
}

interface Mesh {
  // Something outside changed (the floor is to be astir): draw again if there is anything to draw.
  wake: () => void;
  // Release everything.
  stop: () => void;
}

// One context on one canvas. It is made only once the page has loaded and the browser is idle, its
// program linked without holding up the page; it draws only while something changes and only while
// the box is on screen in a visible tab; and `stop` gives everything back.
function startMesh({ surface, box, line, accent, astir, drawn }: MeshOptions): Mesh {
  let disposed = false;
  let lost = false;
  // The context this canvas was given, and (once its program is ready) the context to draw with.
  let owned: WebGL2RenderingContext | null = null;
  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let at: Partial<Record<UniformName, WebGLUniformLocation | null>> = {};
  let lineColor: Rgb = [0, 0, 0];
  let accentColor: Rgb = [0, 0, 0];

  // The box in CSS px, whether it is on screen, and whether it needs drawing whatever else is so
  // (a new size, a box that shows again).
  let boxW = 0;
  let boxH = 0;
  let onScreen = false;
  let dirty = false;
  // Buffer px to a CSS px.
  let density = 1;

  // What the frames ease: how far the floor is astir (and the swell's clock, which runs with it),
  // the fade-in, the pointer's mound.
  let last = 0;
  let clock = 0;
  let gain = 0;
  let revealFrom = 0;
  let reveal = 0;
  let firstFrame = false;
  let clientX = 0;
  let clientY = 0;
  let pointerMoved = false;
  let pointerHere = false;
  let moundX = 0;
  let moundY = 0;
  let toX = 0;
  let toY = 0;
  let mound = 0;
  let moundTo = 0;
  const frameTimes: number[] = [];

  let raf = 0;
  const ready = () =>
    !disposed &&
    !lost &&
    gl !== null &&
    onScreen &&
    !document.hidden &&
    boxW > 0 &&
    boxH > 0;
  const wake = () => {
    if (raf || !ready()) return;
    raf = requestAnimationFrame(tick);
  };

  // --- Setting up, in two parts so it never holds up the page. `begin` makes the context and asks
  // for the program; where the browser links in the background (KHR_parallel_shader_compile) it
  // looks once a frame whether the link is done, and only then `finish` reads the result.
  interface Pending {
    g: WebGL2RenderingContext;
    p: WebGLProgram;
    vs: WebGLShader;
    fs: WebGLShader;
  }
  let pending: Pending | null = null;
  let pollFrame = 0;

  const compile = (g: WebGL2RenderingContext, kind: number, source: string) => {
    const shader = g.createShader(kind);
    if (!shader) return null;
    g.shaderSource(shader, source);
    g.compileShader(shader);
    return shader;
  };

  // Without a usable program the static grid stays the floor, and the context's slot is given back.
  const giveUp = (g: WebGL2RenderingContext) => {
    if (!g.isContextLost()) g.getExtension("WEBGL_lose_context")?.loseContext();
  };

  const begin = () => {
    if (disposed || lost || owned || pending) return;
    const g = surface.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    // No WebGL 2: the static grid is the floor.
    if (!g) return;
    owned = g;
    if (g.isContextLost()) return;
    const parallel = g.getExtension("KHR_parallel_shader_compile");
    const vs = compile(g, g.VERTEX_SHADER, VERT);
    const fs = compile(g, g.FRAGMENT_SHADER, FRAG);
    const p = vs && fs ? g.createProgram() : null;
    if (!vs || !fs || !p) {
      if (vs) g.deleteShader(vs);
      if (fs) g.deleteShader(fs);
      giveUp(g);
      return;
    }
    g.attachShader(p, vs);
    g.attachShader(p, fs);
    g.linkProgram(p);
    pending = { g, p, vs, fs };
    if (!parallel) {
      finish();
      return;
    }
    const poll = () => {
      pollFrame = 0;
      if (disposed || lost || !pending) return;
      if (g.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR)) finish();
      else pollFrame = requestAnimationFrame(poll);
    };
    pollFrame = requestAnimationFrame(poll);
  };

  const finish = () => {
    const job = pending;
    pending = null;
    if (disposed || lost || !job) return;
    const { g, p, vs, fs } = job;
    const linked = !!g.getProgramParameter(p, g.LINK_STATUS);
    if (!linked && import.meta.dev && !g.isContextLost())
      console.error(
        "[IsoFloor] The mesh's program did not link:",
        g.getShaderInfoLog(vs),
        g.getShaderInfoLog(fs),
        g.getProgramInfoLog(p),
      );
    g.detachShader(p, vs);
    g.detachShader(p, fs);
    g.deleteShader(vs);
    g.deleteShader(fs);
    const vertices = linked ? g.createBuffer() : null;
    if (!linked || !vertices) {
      g.deleteProgram(p);
      giveUp(g);
      return;
    }
    program = p;
    buffer = vertices;
    g.useProgram(p);
    // One triangle that covers the canvas.
    g.bindBuffer(g.ARRAY_BUFFER, vertices);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      g.STATIC_DRAW,
    );
    const position = g.getAttribLocation(p, "aPos");
    if (position >= 0) {
      g.enableVertexAttribArray(position);
      g.vertexAttribPointer(position, 2, g.FLOAT, false, 0, 0);
    }
    at = {};
    for (const name of UNIFORMS) at[name] = g.getUniformLocation(p, name);
    g.enable(g.SCISSOR_TEST);
    g.clearColor(0, 0, 0, 0);
    // The colours come from the tokens, read where they are computed (again after a restore).
    lineColor = readColor(line) ?? lineColor;
    accentColor = readColor(accent) ?? accentColor;
    gl = g;
    dirty = true;
    wake();
  };

  // --- The box: its size sets the drawing buffer, and nothing is drawn while it is off screen, in
  // a hidden tab or without a size (the story's timeline takes the floor out of the layout once the
  // opening has handed over). It is drawn again when it shows.
  const fit = () => {
    let scale =
      Math.min(window.devicePixelRatio || 1, 2) * (LADDER[ladderStep] ?? 1);
    const pixels = boxW * boxH * scale * scale;
    if (pixels > PIXEL_BUDGET) scale *= Math.sqrt(PIXEL_BUDGET / pixels);
    const width = Math.max(1, Math.round(boxW * scale));
    const height = Math.max(1, Math.round(boxH * scale));
    if (surface.width !== width) surface.width = width;
    if (surface.height !== height) surface.height = height;
    density = width / boxW;
  };

  const resizeObserver = new ResizeObserver((entries) => {
    const rect = entries[entries.length - 1]?.contentRect;
    if (disposed || !rect) return;
    boxW = rect.width;
    boxH = rect.height;
    dirty = true;
    wake();
  });
  resizeObserver.observe(box);

  const intersectionObserver = new IntersectionObserver((entries) => {
    const latest = entries[entries.length - 1];
    if (disposed || !latest) return;
    onScreen = latest.isIntersecting;
    if (onScreen) dirty = true;
    wake();
  });
  intersectionObserver.observe(box);

  const onVisibility = () => {
    if (document.hidden) return;
    dirty = true;
    wake();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // --- The pointer: a mouse or a pen, never a touch. The handlers only keep where it is; the box
  // is measured in the frame.
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    clientX = event.clientX;
    clientY = event.clientY;
    pointerHere = true;
    pointerMoved = true;
    wake();
  };
  const onGone = () => {
    if (!pointerHere) return;
    pointerHere = false;
    pointerMoved = true;
    wake();
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onGone, {
    passive: true,
  });

  // --- Frames. Each one eases what is still moving and draws if anything changed; when nothing
  // moves any more the loop stops and the last frame stays on the canvas.
  const draw = (g: WebGL2RenderingContext) => {
    const width = surface.width;
    const height = surface.height;
    const stack = (boxW / SPAN) * density;
    const cell = stack * CELL;
    // Only the part the mask shows (the scissor counts from the bottom left).
    const top = Math.floor(SHOWN.top * width);
    const bottom = Math.min(height, Math.ceil(SHOWN.bottom * width));
    g.viewport(0, 0, width, height);
    g.scissor(
      0,
      height - bottom,
      Math.ceil(SHOWN.right * width),
      Math.max(0, bottom - top),
    );
    g.clear(g.COLOR_BUFFER_BIT);
    g.uniform2f(at.uRes ?? null, width, height);
    g.uniform1f(at.uStack ?? null, stack);
    g.uniform1f(at.uCell ?? null, cell);
    g.uniform2f(at.uOrigin ?? null, width / 2, FOOT * width + GAP * stack);
    g.uniform1f(at.uPx ?? null, density);
    g.uniform1f(at.uTime ?? null, clock);
    g.uniform1f(at.uSwell ?? null, gain * gain * (3 - 2 * gain));
    g.uniform3f(at.uPointer ?? null, moundX, moundY, mound);
    const [patchX, patchY] = toGround(PATCH.x * stack, PATCH.y * stack, cell);
    g.uniform2f(at.uPatch ?? null, patchX, patchY);
    g.uniform1f(at.uReveal ?? null, reveal);
    g.uniform3f(at.uLine ?? null, ...lineColor);
    g.uniform3f(at.uAccent ?? null, ...accentColor);
    g.drawArrays(g.TRIANGLES, 0, 3);
  };

  // Frames that keep coming slowly: draw fewer pixels from here on.
  const sample = (ms: number) => {
    frameTimes.push(ms);
    if (frameTimes.length < FRAME_SAMPLE) return;
    const sorted = frameTimes.splice(0).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    if (median > SLOW_FRAME_MS && ladderStep < LADDER.length - 1) {
      ladderStep += 1;
      dirty = true;
    }
  };

  const tick = (now: number) => {
    raf = 0;
    const g = gl;
    if (!g || !ready()) {
      last = 0;
      return;
    }
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    if (last) sample(now - last);
    last = now;
    const wasGain = gain;
    const wasX = moundX;
    const wasY = moundY;
    const wasMound = mound;
    const wasReveal = reveal;

    // The floor comes astir and settles by degrees, and the swell's clock runs only while it is.
    const want = astir() ? 1 : 0;
    if (gain < want) gain = Math.min(1, gain + dt / GAIN_S);
    else if (gain > want) gain = Math.max(0, gain - dt / GAIN_S);
    clock += dt * gain * gain * (3 - 2 * gain);

    // Where the pointer is on the ground, and whether it is near enough to lift the mound.
    if (pointerMoved) {
      pointerMoved = false;
      const rect = box.getBoundingClientRect();
      const stack = rect.width / SPAN;
      const reach = REACH * stack;
      const near =
        pointerHere &&
        stack > 0 &&
        clientX >= rect.left - reach &&
        clientX <= rect.right + reach &&
        clientY >= rect.top - reach &&
        clientY <= rect.bottom + reach;
      if (near) {
        [toX, toY] = toGround(
          clientX - rect.left - rect.width / 2,
          clientY - rect.top - (FOOT * rect.width + GAP * stack),
          stack * CELL,
        );
        // A mound that is down comes up where the pointer is, not from where it last was.
        if (mound < 0.02) {
          moundX = toX;
          moundY = toY;
        }
        moundTo = 1;
      } else {
        moundTo = 0;
      }
    }
    const follow = 1 - Math.exp(-dt / FOLLOW_S);
    moundX += (toX - moundX) * follow;
    moundY += (toY - moundY) * follow;
    if (Math.abs(toX - moundX) + Math.abs(toY - moundY) < 0.002) {
      moundX = toX;
      moundY = toY;
    }
    mound +=
      (moundTo - mound) *
      (1 - Math.exp(-dt / (moundTo > mound ? RISE_S : SINK_S)));
    if (Math.abs(moundTo - mound) < 0.004) mound = moundTo;

    // The mesh's own alpha, from its first frame.
    if (!revealFrom) revealFrom = now;
    reveal = Math.min(1, (now - revealFrom) / (REVEAL_S * 1000));

    const changed =
      gain !== wasGain ||
      gain > 0 ||
      moundX !== wasX ||
      moundY !== wasY ||
      mound !== wasMound ||
      reveal !== wasReveal;
    if (dirty || changed) {
      if (dirty) fit();
      dirty = false;
      draw(g);
      if (!firstFrame) {
        firstFrame = true;
        drawn(true);
      }
    }

    const moving =
      gain > 0 ||
      want > 0 ||
      mound !== moundTo ||
      (mound > 0 && (moundX !== toX || moundY !== toY)) ||
      reveal < 1 ||
      dirty ||
      pointerMoved;
    if (moving) raf = requestAnimationFrame(tick);
    else last = 0;
  };

  // --- A lost context takes every handle with it: the static grid is the floor again at once, and
  // a restored context is set up from the start.
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    if (pollFrame) cancelAnimationFrame(pollFrame);
    raf = pollFrame = 0;
    last = 0;
    pending = null;
    gl = null;
    program = null;
    buffer = null;
    at = {};
    firstFrame = false;
    revealFrom = 0;
    reveal = 0;
    drawn(false);
  };
  const onRestored = () => {
    if (disposed || !lost) return;
    lost = false;
    owned = null;
    begin();
  };
  surface.addEventListener("webglcontextlost", onLost);
  surface.addEventListener("webglcontextrestored", onRestored);

  // --- The mesh waits for the page: it is set up once the page has loaded and the browser is idle,
  // so making the context and linking the program never hold up hydration or the first paints.
  let idle = 0;
  let timer = 0;
  const start = () => {
    idle = timer = 0;
    begin();
  };
  const schedule = () => {
    if (disposed || idle || timer || owned || pending) return;
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(start, { timeout: 2000 });
    else timer = window.setTimeout(start, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  const stop = () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
    if (pollFrame) cancelAnimationFrame(pollFrame);
    if (raf) cancelAnimationFrame(raf);
    idle = timer = pollFrame = raf = 0;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onGone);
    surface.removeEventListener("webglcontextlost", onLost);
    surface.removeEventListener("webglcontextrestored", onRestored);
    if (pending && !pending.g.isContextLost()) {
      pending.g.deleteShader(pending.vs);
      pending.g.deleteShader(pending.fs);
      pending.g.deleteProgram(pending.p);
    }
    pending = null;
    if (owned && !owned.isContextLost()) {
      owned.useProgram(null);
      owned.bindBuffer(owned.ARRAY_BUFFER, null);
      if (buffer) owned.deleteBuffer(buffer);
      if (program) owned.deleteProgram(program);
      // The canvas is this component's alone: its context's slot goes back to the browser too.
      owned.getExtension("WEBGL_lose_context")?.loseContext();
    }
    owned = gl = null;
    program = null;
    buffer = null;
    at = {};
  };

  return { wake, stop };
}
</script>

<script setup lang="ts">
// Scenery (aria-hidden). The parent gives the root its box (and positions it), and may cut it
// shorter than the plane; the root takes the class and attributes passed to it. The story's
// timeline owns the root's opacity, so nothing here sets it: every fade below is a mask, an inner
// element's opacity or the mesh's own alpha.
const props = defineProps<{
  // The hero's idle loops are running (HomeIntro's hero--live): the mesh is astir with them. Never
  // true under reduced motion.
  live?: boolean;
}>();

// The mesh is also astir by itself for a few seconds from the first paint: on hydration that is
// the page's first contentful paint (the page's start where the browser does not report it, which
// only shortens the time), on a client-side navigation the mount.
const hydrating = import.meta.client && useNuxtApp().isHydrating === true;
let mountedAt = 0;

function astir() {
  if (props.live === true) return true;
  const painted = hydrating
    ? (performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0)
    : mountedAt;
  return performance.now() < painted + (AUTO_S - GAIN_S) * 1000;
}

// The static grid's gradients and masks, each with an id of its own: the patch's haze; where its
// lime is (the bell), and where it is not (the rest), as fills and as the masks made of them.
const hazeId = useId();
const litId = useId();
const unlitId = useId();
const litMaskId = useId();
const unlitMaskId = useId();
const bells = [
  {
    id: hazeId,
    space: hazeSpace,
    stops: bellStops.map(({ offset, value }) => ({
      offset,
      opacity: Math.round(value * look.haze * 1000) / 1000,
    })),
  },
  {
    id: litId,
    space: litSpace,
    stops: bellStops.map(({ offset, value }) => ({ offset, opacity: value })),
  },
  {
    id: unlitId,
    space: litSpace,
    stops: bellStops.map(({ offset, value }) => ({
      offset,
      opacity: Math.round((1 - value) * 1000) / 1000,
    })),
  },
];
const masks = [
  { id: litMaskId, fill: `url(#${litId})` },
  { id: unlitMaskId, fill: `url(#${unlitId})` },
];

const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const lineSwatch = ref<HTMLElement | null>(null);
const accentSwatch = ref<HTMLElement | null>(null);
// Whether there is a canvas (the mesh's query matches), and whether the mesh is drawing on it.
const wanted = ref(false);
const drawn = ref(false);

let mesh: Mesh | null = null;
let query: MediaQueryList | undefined;

function stopMesh() {
  mesh?.stop();
  mesh = null;
  if (drawn.value) drawn.value = false;
}

// A canvas appears when the query starts to match and goes when it stops: a mesh is started on a
// new canvas and released with it (a canvas whose context was given up cannot be used again).
watch(
  canvas,
  (surface) => {
    stopMesh();
    if (!surface || !root.value) return;
    mesh = startMesh({
      surface,
      box: root.value,
      line: lineSwatch.value,
      accent: accentSwatch.value,
      astir,
      drawn: (on) => {
        drawn.value = on;
      },
    });
  },
  { flush: "post" },
);

// The hero going live brings the floor astir again.
watch(
  () => props.live,
  () => mesh?.wake(),
);

function matchQuery() {
  wanted.value = query?.matches === true;
}

onMounted(() => {
  mountedAt = performance.now();
  query = window.matchMedia(meshQuery);
  query.addEventListener("change", matchQuery);
  matchQuery();
});

onBeforeUnmount(() => {
  query?.removeEventListener("change", matchQuery);
  stopMesh();
});
</script>

<template>
  <div
    ref="root"
    class="iso-floor"
    :class="{ 'iso-floor--drawn': drawn }"
    aria-hidden="true"
  >
    <div class="iso-floor__plane">
      <svg class="iso-floor__grid" :viewBox="viewBox" focusable="false">
        <defs>
          <radialGradient
            v-for="bell in bells"
            :id="bell.id"
            :key="bell.id"
            gradientUnits="userSpaceOnUse"
            cx="0"
            cy="0"
            r="1"
            :gradientTransform="bell.space"
          >
            <stop
              v-for="stop in bell.stops"
              :key="stop.offset"
              class="iso-floor__stop"
              :offset="stop.offset"
              :stop-opacity="stop.opacity"
            />
          </radialGradient>
          <mask
            v-for="mask in masks"
            :id="mask.id"
            :key="mask.id"
            class="iso-floor__mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            :width="round(WIDTH)"
            :height="HEIGHT"
          >
            <rect :width="round(WIDTH)" :height="HEIGHT" :fill="mask.fill" />
          </mask>
        </defs>
        <!-- The patch: its haze, then the grid's lines turning from grey to lime toward its centre
             (the grey ones fade out as the lime ones come in), then the crossings it lights. -->
        <rect :width="round(WIDTH)" :height="HEIGHT" :fill="`url(#${hazeId})`" />
        <path
          class="iso-floor__lines"
          :d="lines"
          :stroke-opacity="look.line"
          :mask="`url(#${unlitMaskId})`"
        />
        <path
          class="iso-floor__lines iso-floor__lines--lime"
          :d="lines"
          :stroke-opacity="look.lineLit"
          :mask="`url(#${litMaskId})`"
        />
        <path
          class="iso-floor__nodes"
          :d="nodes"
          :stroke-opacity="look.node"
          :mask="`url(#${litMaskId})`"
        />
      </svg>
    </div>
    <!-- The mesh's canvas, and two elements that carry the tokens it draws with as their colour.
         Only where the mesh's query matches, and only after mount. -->
    <template v-if="wanted">
      <canvas ref="canvas" class="iso-floor__canvas" />
      <span ref="lineSwatch" class="iso-floor__swatch iso-floor__swatch--line" />
      <span
        ref="accentSwatch"
        class="iso-floor__swatch iso-floor__swatch--accent"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
// The plane's proportions (WIDTH and HEIGHT in the script; keep them in step).
$plane-w: 1293.6;
$plane-h: 900;
// The floor's mask, as an image with the plane's proportions, so it is sized by the box's width
// alone however tall the parent makes the box. Two fades multiplied: a radial one, strongest under
// the stack and toward the end side (the stack's foot is at 50% 37.4% of the plane), gone before
// the plane's top and, on the reading side, before the text beside the stack (centre 40% 34%,
// radii 44% and 30% of the plane, full to 22% of the way out); and a linear one that ends before
// the lowest edge a parent cuts the box at (full to 43% of the plane's height, gone at 46.7%; the
// cut is 0.12 stack heights under the foot, 46.8%). The black and white are only the mask's shape.
// SHOWN in the script is the box these leave anything in; keep it in step.
$mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1293.6' height='900' viewBox='0 0 1293.6 900'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='1' gradientTransform='translate(517.44 306) scale(569.18 270)'%3E%3Cstop offset='.22'/%3E%3Cstop offset='1' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' x2='0' y2='1'%3E%3Cstop offset='.43' stop-color='white'/%3E%3Cstop offset='.467'/%3E%3C/linearGradient%3E%3Cmask id='c'%3E%3Crect width='1293.6' height='900' fill='url(%23b)'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='1293.6' height='900' fill='url(%23a)' mask='url(%23c)'/%3E%3C/svg%3E");

// The root has no position of its own: the parent positions it, and the canvas fills that box.
.iso-floor {
  overflow: hidden;
  pointer-events: none;
  mask-image: $mask;
  mask-position: 50% 0;
  mask-size: 100% auto;
  mask-repeat: no-repeat;

  // The static grid's plane hangs from the top of the box, as wide as it.
  &__plane {
    aspect-ratio: #{$plane-w} / #{$plane-h};
  }

  &__grid {
    inline-size: 100%;
    block-size: 100%;
  }

  // While the mesh draws, the static grid under it is out: it fades as the mesh's own alpha comes
  // up (REVEAL_S in the script), then stops being painted. When the class goes (a lost context)
  // it is back at once.
  &--drawn &__grid {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 600ms linear,
      visibility 0s linear 600ms;
  }

  // Drawn as the mesh draws them: lines one pixel wide and crossings as dots 3.6 pixels across,
  // whatever size the plane is shown at; how strong each is comes from the mesh's own numbers, as
  // attributes.
  &__lines {
    fill: none;
    stroke: var(--border-strong);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;

    &--lime {
      stroke: var(--accent);
    }
  }

  &__nodes {
    fill: none;
    stroke: var(--accent);
    stroke-width: 3.6px;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  // The patch's bells: lime, as strong as each stop says. In a mask only that strength counts.
  &__stop {
    stop-color: var(--accent);
  }

  &__mask {
    mask-type: alpha;
  }

  &__canvas {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  // Never shown: the mesh reads the two tokens from these as computed colours.
  &__swatch {
    display: none;

    &--line {
      color: var(--border-strong);
    }

    &--accent {
      color: var(--accent);
    }
  }
}

// The grid fades in with the first paint, for visitors who have not asked for less. On the plane,
// not the root: the root's opacity is the story's.
@media (prefers-reduced-motion: no-preference) {
  .iso-floor__plane {
    animation: iso-floor-in 600ms var(--ease-out) 200ms backwards;
  }

  @keyframes iso-floor-in {
    from {
      opacity: 0;
    }
  }
}
</style>
