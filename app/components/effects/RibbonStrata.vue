<script setup lang="ts">
import { ribbonStrataFragment } from "./ribbonStrataShader";
const canvas = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
let dispose: (() => void) | undefined;
onMounted(() => {
  const el = canvas.value;
  const host = el?.parentElement;
  if (!el || !host) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover:hover) and (pointer:fine)");
  let cleanup: (() => void) | undefined;
  function start() {
    cleanup?.();
    ready.value = false;
    if (reduced.matches || !el || !host) return;
    let gl: WebGL2RenderingContext | null;
    try {
      gl = el.getContext("webgl2", {
        alpha: false,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    if (!gl) return;
    const ctx = gl;
    function compile(kind: number, source: string) {
      const shader = ctx.createShader(kind);
      if (!shader) return null;
      ctx.shaderSource(shader, source);
      ctx.compileShader(shader);
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        ctx.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vertex = compile(
      ctx.VERTEX_SHADER,
      "#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}",
    );
    const fragment = compile(ctx.FRAGMENT_SHADER, ribbonStrataFragment);
    if (!vertex || !fragment) {
      if (vertex) ctx.deleteShader(vertex);
      if (fragment) ctx.deleteShader(fragment);
      return;
    }
    const program = ctx.createProgram();
    if (!program) {
      ctx.deleteShader(vertex);
      ctx.deleteShader(fragment);
      return;
    }
    ctx.attachShader(program, vertex);
    ctx.attachShader(program, fragment);
    ctx.linkProgram(program);
    ctx.deleteShader(vertex);
    ctx.deleteShader(fragment);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      ctx.deleteProgram(program);
      return;
    }
    const vao = ctx.createVertexArray();
    ctx.bindVertexArray(vao);
    ctx.useProgram(program);
    const resolution = ctx.getUniformLocation(program, "u_resolution");
    const pointer = ctx.getUniformLocation(program, "u_pointer");
    const time = ctx.getUniformLocation(program, "u_time");
    let frame = 0,
      visible = false,
      disposed = false,
      lost = false,
      px = 0,
      py = 0,
      tx = 0,
      ty = 0,
      last = 0,
      elapsed = 0;
    const pause = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    function draw(now: number) {
      frame = 0;
      if (disposed || lost || !visible || document.hidden || reduced.matches)
        return;
      elapsed += last ? Math.min((now - last) / 1000, 0.06) : 0;
      last = now;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      ctx.uniform2f(pointer, px, py);
      ctx.uniform1f(time, elapsed);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      if (!ready.value) ready.value = true;
      frame = requestAnimationFrame(draw);
    }
    function resume() {
      if (
        !frame &&
        !disposed &&
        !lost &&
        visible &&
        !document.hidden &&
        !reduced.matches
      )
        frame = requestAnimationFrame(draw);
    }
    function size() {
      if (!el || !host || lost) return;
      const r = host.getBoundingClientRect();
      const scale = Math.min(
        devicePixelRatio || 1,
        1.25,
        1600 / Math.max(r.width, 1),
        1600 / Math.max(r.height, 1),
      );
      el.width = Math.max(1, Math.round(r.width * scale));
      el.height = Math.max(1, Math.round(r.height * scale));
      ctx.viewport(0, 0, el.width, el.height);
      ctx.uniform2f(resolution, el.width, el.height);
    }
    function move(e: PointerEvent) {
      if (!host || !fine.matches || e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / Math.max(r.width, 1) - 0.5;
      ty = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
    }
    function reset() {
      tx = ty = 0;
    }
    function visibility() {
      document.hidden ? pause() : resume();
    }
    function contextLost(e: Event) {
      e.preventDefault();
      lost = true;
      pause();
      ready.value = false;
    }
    function contextRestored() {
      start();
    }
    const ro = new ResizeObserver(() => {
      size();
      resume();
    });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      visible ? resume() : pause();
    });
    ro.observe(host);
    io.observe(host);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", visibility);
    el.addEventListener("webglcontextlost", contextLost);
    el.addEventListener("webglcontextrestored", contextRestored);
    size();
    cleanup = () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", visibility);
      el.removeEventListener("webglcontextlost", contextLost);
      el.removeEventListener("webglcontextrestored", contextRestored);
      ctx.deleteVertexArray(vao);
      ctx.deleteProgram(program);
    };
  }
  reduced.addEventListener("change", start);
  start();
  dispose = () => {
    reduced.removeEventListener("change", start);
    cleanup?.();
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
