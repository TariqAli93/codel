<script setup lang="ts">
import { foldedFieldFragment } from "./foldedFieldShader";
const props = defineProps<{ fragment?: string; settleAfter?: number; scrollMotion?: boolean; maxResolution?: number; vertex?: string; points?: boolean; ambient?: boolean; paused?: boolean }>();
const emit = defineEmits<{ "motion-ready": [ready: boolean] }>();
const canvas = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
watch(ready, value => emit("motion-ready", value));
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
      props.vertex ?? "#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}",
    );
    const fragment = compile(ctx.FRAGMENT_SHADER, props.fragment ?? foldedFieldFragment);
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
    if (!vao) { ctx.deleteProgram(program); return; }
    ctx.bindVertexArray(vao);
    ctx.useProgram(program);
    if (props.points) { ctx.enable(ctx.BLEND); ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA); ctx.clearColor(16/255,20/255,17/255,1); }
    const resolution = ctx.getUniformLocation(program, "u_resolution");
    const pointer = ctx.getUniformLocation(program, "u_pointer");
    const time = ctx.getUniformLocation(program, "u_time");
    const scrollUniform = ctx.getUniformLocation(program, "u_scroll");
    const countUniform = ctx.getUniformLocation(program, "u_count");
    const presenceUniform = ctx.getUniformLocation(program, "u_presence");
    const introUniform = ctx.getUniformLocation(program, "u_intro");
    const velocityUniform = ctx.getUniformLocation(program, "u_velocity");
    let count = 40000, presence = 0, targetPresence = 0;
    let vx = 0, vy = 0, tvx = 0, tvy = 0, lastPointer = 0;
    let portrait = false;
    let scroll = 0, targetScroll = 0;
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
      if (disposed || lost || !visible || document.hidden || reduced.matches || (props.paused && ready.value))
        return;
      const interactive = Math.abs(tx-px)+Math.abs(ty-py)+Math.abs(targetScroll-scroll)+Math.abs(targetPresence-presence)+Math.abs(vx)+Math.abs(vy) > .002;
      const fps = props.ambient && elapsed > 2.25 && !interactive ? (portrait ? 24 : 30) : 60;
      if(last && now-last < 1000/fps-1.5) { frame=requestAnimationFrame(draw); return; }
      const dt = last ? Math.min((now - last) / 1000, 0.06) : 1 / 60;
      elapsed += dt;
      if (!props.ambient && props.settleAfter !== undefined) elapsed = Math.min(elapsed, props.settleAfter);
      last = now;
      const ease = 1-Math.exp(-dt*10);
      px += (tx - px) * ease;
      py += (ty - py) * ease;
      scroll += (targetScroll-scroll)*ease;
      presence += (targetPresence-presence)*ease;
      const viscous = 1-Math.exp(-dt*6);
      vx += (tvx-vx)*viscous; vy += (tvy-vy)*viscous;
      tvx *= Math.exp(-dt*5); tvy *= Math.exp(-dt*5);
      ctx.uniform2f(velocityUniform,vx,vy);
      ctx.uniform1f(introUniform, Math.min(elapsed,2.25));
      ctx.uniform2f(pointer, px, py);
      ctx.uniform1f(time, elapsed);
      ctx.uniform1f(scrollUniform, scroll);
      if (props.points) {
        ctx.uniform1f(countUniform, count);
        ctx.uniform1f(presenceUniform, presence);
        ctx.clear(ctx.COLOR_BUFFER_BIT);
        ctx.drawArrays(ctx.POINTS, 0, count);
      } else ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      if (!ready.value) ready.value = true;
      const moving = Math.abs(tx-px)+Math.abs(ty-py)+Math.abs(targetScroll-scroll)+Math.abs(targetPresence-presence) > .0005;
      if (!props.paused && (props.ambient || props.settleAfter === undefined || elapsed < props.settleAfter || moving)) frame = requestAnimationFrame(draw);
      else last=0;
    }
    function resume() {
      if (
        !frame &&
        !disposed &&
        !lost &&
        visible &&
        !document.hidden &&
        !reduced.matches && (!props.paused || !ready.value)
      )
        frame = requestAnimationFrame(draw);
    }
    function size() {
      if (!el || !host || lost) return;
      const r = host.getBoundingClientRect();
      portrait = r.width/r.height < 1;
      count = props.ambient ? (portrait ? 30000 : 52000) : (portrait ? 24000 : 40000);
      const scale = Math.min(
        devicePixelRatio || 1,
        1.25,
        (props.maxResolution ?? 1600) / Math.max(r.width, 1),
        (props.maxResolution ?? 1600) / Math.max(r.height, 1),
      );
      el.width = Math.max(1, Math.round(r.width * scale));
      el.height = Math.max(1, Math.round(r.height * scale));
      ctx.viewport(0, 0, el.width, el.height);
      ctx.uniform2f(resolution, el.width, el.height);
    }
    function move(e: PointerEvent) {
      if (!host || !fine.matches || e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      const nx = Math.max(-.5,Math.min(.5,(e.clientX-r.left)/Math.max(r.width,1)-.5));
      const ny = Math.max(-.5,Math.min(.5,(e.clientY-r.top)/Math.max(r.height,1)-.5));
      const dt = Math.max(.016,(e.timeStamp-lastPointer)/1000);
      if(lastPointer && dt < .15){tvx=Math.max(-.8,Math.min(.8,(nx-tx)/dt*.22));tvy=Math.max(-.8,Math.min(.8,(ny-ty)/dt*.22));}
      lastPointer=e.timeStamp;tx=nx;ty=ny;
      targetPresence = 1;
      resume();
    }
    function reset() {
      targetPresence = 0;
      tvx=tvy=0;lastPointer=0;
      if (!props.points) tx = ty = 0;
      resume();
    }
    function onScroll() {
      if (!host || !props.scrollMotion || !visible) return;
      const r=host.getBoundingClientRect();
      targetScroll=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height)));
      resume();
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
      if(props.paused) ready.value=false;
      onScroll();
      resume();
    });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) onScroll();
      visible ? resume() : pause();
    });
    ro.observe(host);
    io.observe(host);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", reset);
    host.addEventListener("pointercancel", reset);
    document.addEventListener("visibilitychange", visibility);
    if (props.scrollMotion) window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("webglcontextlost", contextLost);
    el.addEventListener("webglcontextrestored", contextRestored);
    const stopPauseWatch=watch(()=>props.paused, value=>{if(value){pause();}else{resume();}});
    size();
    onScroll();
    cleanup = () => {
      disposed = true;
      stopPauseWatch();
      pause();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      host.removeEventListener("pointercancel", reset);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", onScroll);
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
