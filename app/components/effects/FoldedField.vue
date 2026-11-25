<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { foldedFieldFragment } from "./foldedFieldShader";

const props = defineProps<{
  fragment?: string;
  settleAfter?: number;
  scrollMotion?: boolean;
  maxResolution?: number;
  vertex?: string;
  points?: boolean;
  ambient?: boolean;
  paused?: boolean;
  // Optional quality controls; existing consumers need no changes.
  maxDpr?: number;
  particleCount?: number;
  idleFps?: number;
}>();
const emit = defineEmits<{ "motion-ready": [ready: boolean] }>();
const canvas = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
watch(ready, (value) => emit("motion-ready", value));

const DEFAULT_VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const INTRO_SECONDS = 2.25;
const MAX_DT = 0.1;
const EPSILON = 0.0005;
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const finite = (n: number | undefined, fallback: number) =>
  n !== undefined && Number.isFinite(n) ? n : fallback;
const damp = (value: number, target: number, rate: number, dt: number) => {
  const next = value + (target - value) * -Math.expm1(-rate * dt);
  return Math.abs(next - target) < EPSILON / 4 ? target : next;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn(
    "[MaterialCanvas] Shader compilation failed:",
    gl.getShaderInfoLog(shader),
  );
  gl.deleteShader(shader);
  return null;
}

function createRenderer(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, props.vertex ?? DEFAULT_VERTEX);
  if (!vertex) return null;
  const fragment = compile(
    gl,
    gl.FRAGMENT_SHADER,
    props.fragment ?? foldedFieldFragment,
  );
  if (!fragment) {
    gl.deleteShader(vertex);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.detachShader(program, vertex);
  gl.detachShader(program, fragment);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(
      "[MaterialCanvas] Program linking failed:",
      gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    return null;
  }
  const vao = gl.createVertexArray();
  if (!vao) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.SCISSOR_TEST);
  if (props.points) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(16 / 255, 20 / 255, 17 / 255, 1);
  } else {
    gl.disable(gl.BLEND);
  }
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    resolution: uniform("u_resolution"),
    pointer: uniform("u_pointer"),
    time: uniform("u_time"),
    scroll: uniform("u_scroll"),
    count: uniform("u_count"),
    presence: uniform("u_presence"),
    intro: uniform("u_intro"),
    velocity: uniform("u_velocity"),
  };
  const limits = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
  const maxRenderbuffer = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number;
  return {
    program,
    vao,
    uniforms,
    maxWidth: Math.min(limits[0], maxRenderbuffer),
    maxHeight: Math.min(limits[1], maxRenderbuffer),
    dispose() {
      gl.bindVertexArray(null);
      gl.useProgram(null);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}

let dispose: (() => void) | undefined;

onMounted(() => {
  const element = canvas.value;
  const parent = element?.parentElement;
  if (!element || !parent) return;
  const el: HTMLCanvasElement = element;
  const host: HTMLElement = parent;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  let gl: WebGL2RenderingContext | null = null;
  let renderer: ReturnType<typeof createRenderer> = null;
  let disposed = false;
  let lost = false;
  let visible = false;
  let hasSize = false;
  let portrait = false;
  let count = 40000;
  let frame: number | null = null;
  let lastDraw: number | null = null;
  let nextDraw: number | null = null;
  let lastFps = 60;
  let elapsed = 0;
  let needsDraw = true;
  let sizeDirty = true;
  let scrollDirty = true;
  let lastDpr = 0;
  let px = 0,
    py = 0,
    tx = 0,
    ty = 0;
  let vx = 0,
    vy = 0,
    tvx = 0,
    tvy = 0;
  let presence = 0,
    targetPresence = 0;
  let scroll = 0,
    targetScroll = 0;
  let lastPointer: number | null = null;
  let pendingPointer: { x: number; y: number; time: number } | null = null;

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastDraw = nextDraw = null;
  }

  function canDraw() {
    return (
      !disposed &&
      !lost &&
      !!renderer &&
      visible &&
      !document.hidden &&
      !reduced.matches
    );
  }

  function schedule() {
    if (
      frame === null &&
      canDraw() &&
      (!props.paused || needsDraw || sizeDirty || !ready.value)
    ) {
      frame = requestAnimationFrame(draw);
    }
  }

  function release() {
    stop();
    if (!lost && gl && !gl.isContextLost()) renderer?.dispose();
    renderer = null;
    ready.value = false;
  }

  function resetMotion() {
    elapsed = 0;
    px = py = tx = ty = vx = vy = tvx = tvy = 0;
    presence = targetPresence = scroll = targetScroll = 0;
    lastPointer = null;
    pendingPointer = null;
    needsDraw = sizeDirty = scrollDirty = true;
  }

  function start() {
    release();
    if (disposed || lost || reduced.matches) return;
    try {
      gl ??= el.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("[MaterialCanvas] WebGL2 initialization failed:", error);
      return;
    }
    if (!gl || gl.isContextLost()) return;
    renderer = createRenderer(gl);
    if (!renderer) return;
    resetMotion();
    schedule();
  }

  function resize(rect: DOMRect, dpr: number) {
    if (!gl || !renderer) return;
    hasSize = rect.width > 0 && rect.height > 0;
    if (!hasSize) return;
    portrait = rect.width < rect.height;
    const maxDimension = Math.max(
      1,
      Math.floor(finite(props.maxResolution, 1600)),
    );
    const scale = Math.min(
      dpr,
      clamp(finite(props.maxDpr, 1.25), 0.25, 3),
      maxDimension / Math.max(rect.width, rect.height),
      renderer.maxWidth / rect.width,
      renderer.maxHeight / rect.height,
    );
    const width = Math.max(1, Math.floor(rect.width * scale));
    const height = Math.max(1, Math.floor(rect.height * scale));
    if (el.width !== width) el.width = width;
    if (el.height !== height) el.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(renderer.uniforms.resolution, width, height);
    if (props.points) {
      const cap = props.ambient
        ? portrait
          ? 30000
          : 52000
        : portrait
          ? 24000
          : 40000;
      // CSS-pixel area, not DPR, keeps density consistent across high-DPI displays.
      const referenceArea = portrait ? 390 * 844 : 1280 * 720;
      const density = clamp(
        Math.sqrt((rect.width * rect.height) / referenceArea),
        0.35,
        1,
      );
      count = Math.round(
        clamp(finite(props.particleCount, cap * density), 1, 200000),
      );
    }
    needsDraw = true;
  }

  function samplePointer(rect: DOMRect) {
    const p = pendingPointer;
    pendingPointer = null;
    if (!p || !fine.matches) return;
    const nx = clamp(
      (p.x - rect.left) / Math.max(rect.width, 1) - 0.5,
      -0.5,
      0.5,
    );
    const ny = clamp(
      (p.y - rect.top) / Math.max(rect.height, 1) - 0.5,
      -0.5,
      0.5,
    );
    const dt = lastPointer === null ? Infinity : (p.time - lastPointer) / 1000;
    if (dt > 0 && dt < 0.15) {
      tvx = clamp(((nx - tx) / Math.max(0.016, dt)) * 0.22, -0.8, 0.8);
      tvy = clamp(((ny - ty) / Math.max(0.016, dt)) * 0.22, -0.8, 0.8);
    } else {
      tvx = tvy = 0;
    }
    lastPointer = p.time;
    tx = nx;
    ty = ny;
    targetPresence = 1;
  }

  function motionError() {
    return (
      Math.abs(tx - px) +
      Math.abs(ty - py) +
      Math.abs(targetScroll - scroll) +
      Math.abs(targetPresence - presence) +
      Math.abs(vx) +
      Math.abs(vy) +
      Math.abs(tvx) +
      Math.abs(tvy)
    );
  }

  function draw(now: number) {
    frame = null;
    if (!canDraw() || !gl || !renderer) return;
    const dpr = window.devicePixelRatio || 1;
    const resizing = sizeDirty || dpr !== lastDpr;
    const dirty = needsDraw || resizing;
    const idle =
      props.ambient &&
      elapsed > INTRO_SECONDS &&
      !pendingPointer &&
      !scrollDirty &&
      motionError() < 0.002;
    const fps = idle
      ? clamp(finite(props.idleFps, portrait ? 24 : 30), 15, 60)
      : 60;
    const interval = 1000 / fps;
    if (fps !== lastFps)
      nextDraw = lastDraw === null ? null : lastDraw + interval;
    lastFps = fps;
    if (!props.paused && !dirty && nextDraw !== null && now < nextDraw - 0.5) {
      schedule();
      return;
    }
    // Preserve cadence across refresh rates; reset after stalls or forced redraws.
    nextDraw =
      nextDraw === null || dirty || now - nextDraw > interval
        ? now + interval
        : nextDraw + interval;

    // At most one layout read per rendered frame, even with multiple input events.
    if (resizing || scrollDirty || pendingPointer) {
      const rect = host.getBoundingClientRect();
      if (resizing) {
        sizeDirty = false;
        lastDpr = dpr;
        resize(rect, dpr);
      }
      if (scrollDirty) {
        targetScroll = props.scrollMotion
          ? clamp(-rect.top / Math.max(1, rect.height), 0, 1)
          : 0;
        scrollDirty = false;
      }
      if (!props.paused) samplePointer(rect);
    }
    if (!hasSize) {
      lastDraw = nextDraw = null;
      return;
    }
    const dt = props.paused
      ? 0
      : lastDraw === null
        ? 1 / 60
        : clamp((now - lastDraw) / 1000, 0, MAX_DT);
    lastDraw = now;
    const settle =
      props.settleAfter === undefined
        ? Infinity
        : Math.max(0, finite(props.settleAfter, Infinity));
    if (!props.paused) {
      elapsed = props.ambient ? elapsed + dt : Math.min(elapsed + dt, settle);
      px = damp(px, tx, 10, dt);
      py = damp(py, ty, 10, dt);
      scroll = damp(scroll, targetScroll, 10, dt);
      presence = damp(presence, targetPresence, 10, dt);
      vx = damp(vx, tvx, 6, dt);
      vy = damp(vy, tvy, 6, dt);
      tvx = damp(tvx, 0, 5, dt);
      tvy = damp(tvy, 0, 5, dt);
    }
    const u = renderer.uniforms;
    gl.uniform2f(u.pointer, px, py);
    gl.uniform2f(u.velocity, vx, vy);
    gl.uniform1f(u.time, elapsed);
    gl.uniform1f(u.intro, Math.min(elapsed, INTRO_SECONDS));
    gl.uniform1f(u.scroll, scroll);
    gl.uniform1f(u.presence, presence);
    if (props.points) {
      gl.uniform1f(u.count, count);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    needsDraw = false;
    if (!ready.value) ready.value = true;
    if (
      !props.paused &&
      (props.ambient || elapsed < settle || motionError() > EPSILON)
    ) {
      schedule();
    } else {
      lastDraw = nextDraw = null;
    }
  }

  function pointerMove(e: PointerEvent) {
    if (!fine.matches || e.pointerType !== "mouse" || props.paused) return;
    pendingPointer = { x: e.clientX, y: e.clientY, time: e.timeStamp };
    schedule();
  }
  function pointerReset() {
    pendingPointer = null;
    targetPresence = tvx = tvy = 0;
    lastPointer = null;
    // Point shaders retain the last position while presence fades out.
    if (!props.points) tx = ty = 0;
    schedule();
  }
  function onScroll() {
    if (!props.scrollMotion) return;
    scrollDirty = true;
    schedule();
  }
  function onResize() {
    sizeDirty = scrollDirty = needsDraw = true;
    schedule();
  }
  function onVisibility() {
    if (document.hidden) stop();
    else {
      scrollDirty = true;
      schedule();
    }
  }
  function contextLost(e: Event) {
    e.preventDefault();
    lost = true;
    release();
  }
  function contextRestored() {
    lost = false;
    start();
  }
  function onFineChange() {
    if (!fine.matches) pointerReset();
  }
  function onMotionChange() {
    if (reduced.matches) release();
    else start();
  }

  // Observe independently of the GPU resources, including after context loss.
  const ro = new ResizeObserver(onResize);
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (!visible) stop();
    else {
      sizeDirty = scrollDirty = needsDraw = true;
      schedule();
    }
  });
  ro.observe(host);
  io.observe(host);
  host.addEventListener("pointermove", pointerMove, { passive: true });
  host.addEventListener("pointerleave", pointerReset);
  host.addEventListener("pointercancel", pointerReset);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  el.addEventListener("webglcontextlost", contextLost);
  el.addEventListener("webglcontextrestored", contextRestored);
  reduced.addEventListener("change", onMotionChange);
  fine.addEventListener("change", onFineChange);

  const stopShaderWatch = watch(
    () => [props.vertex, props.fragment, props.points] as const,
    start,
  );
  const stopQualityWatch = watch(
    () =>
      [
        props.maxResolution,
        props.maxDpr,
        props.particleCount,
        props.ambient,
      ] as const,
    onResize,
  );
  const stopTimingWatch = watch(
    () => [props.settleAfter, props.idleFps] as const,
    () => {
      needsDraw = true;
      schedule();
    },
  );
  const stopScrollWatch = watch(
    () => props.scrollMotion,
    () => {
      scrollDirty = true;
      needsDraw = true;
      schedule();
    },
  );
  const stopPauseWatch = watch(
    () => props.paused,
    (paused) => {
      stop();
      if (paused) {
        pendingPointer = null;
        lastPointer = null;
      } else {
        scrollDirty = true;
      }
      // Draw once if the paused canvas is new or has been invalidated.
      schedule();
    },
  );

  start();
  dispose = () => {
    disposed = true;
    stopShaderWatch();
    stopQualityWatch();
    stopTimingWatch();
    stopScrollWatch();
    stopPauseWatch();
    ro.disconnect();
    io.disconnect();
    host.removeEventListener("pointermove", pointerMove);
    host.removeEventListener("pointerleave", pointerReset);
    host.removeEventListener("pointercancel", pointerReset);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    el.removeEventListener("webglcontextlost", contextLost);
    el.removeEventListener("webglcontextrestored", contextRestored);
    reduced.removeEventListener("change", onMotionChange);
    fine.removeEventListener("change", onFineChange);
    release();
    gl = null;
  };
});

onBeforeUnmount(() => dispose?.());
</script>

<template>
  <canvas
    ref="canvas"
    class="material-canvas"
    :class="{ ready }"
    aria-hidden="true"
  />
</template>
