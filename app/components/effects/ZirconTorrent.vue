<script lang="ts">
import type { Advanced, Direction, Placement } from './zirconConfig'

// Declared in this file, not imported into defineProps: the SFC compiler can only follow a props type
// into another file when the `typescript` package is installed, and this project does not install it.
export interface ZirconTorrentProps {
    background?: string
    baseColor?: string
    accentColor?: string
    strands?: number
    glow?: number
    floor?: number
    scale?: number
    zoom?: number
    placement?: Partial<Placement>
    hover?: number
    hoverSpeed?: number
    surge?: boolean
    speed?: number
    direction?: Partial<Direction>
    advanced?: Partial<Advanced>
    /** Attach pointer listeners to the surrounding hero instead of the canvas. */
    trackParent?: boolean
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
    DEFAULTS, UNIFORMS, num, resolve,
    type RGB, type UName,
} from './zirconConfig'
import { FRAG, VERT } from './zirconShaders'

const props = withDefaults(defineProps<ZirconTorrentProps>(), {
    background: DEFAULTS.background,
    baseColor: DEFAULTS.baseColor,
    accentColor: DEFAULTS.accentColor,
    strands: DEFAULTS.strands,
    glow: DEFAULTS.glow,
    floor: DEFAULTS.floor,
    scale: DEFAULTS.scale,
    zoom: DEFAULTS.zoom,
    hover: DEFAULTS.hover,
    hoverSpeed: DEFAULTS.hoverSpeed,
    surge: DEFAULTS.surge,
    speed: DEFAULTS.speed,
    trackParent: false,
})

const root = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const config = computed(() => resolve(props))
let wakeCurrent: (() => void) | null = null
let cleanupCurrent: (() => void) | null = null
const stopWatch = watch(config, () => wakeCurrent?.())

onMounted(() => {
    const element = root.value
    const surface = canvas.value
    if (!element || !surface) return

    const pointerTarget: HTMLElement = props.trackParent ? (element.parentElement ?? element) : element
    const reducedQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let reduced = !!reducedQuery?.matches
    const onReduced = (e: MediaQueryListEvent) => { reduced = e.matches; dirty = true; wake() }
    reducedQuery?.addEventListener('change', onReduced)

    const REF_ASPECT = 1200 / 800
    const MAX_SURGES = 4
    const PIXEL_BUDGET = 2.6e6
    const LADDER = [1, 0.85, 0.72, 0.6]
    const SURGE_LIFE = 4.5
    const SWING_W = 5.7
    const SWING_Z = 0.45
    const RUSH_S = 0.6
    const FOLLOW_S = 0.09
    const PERSPECTIVE = 2.5

    let gl: WebGL2RenderingContext | null = null
    let program: WebGLProgram | null = null
    let vertexBuffer: WebGLBuffer | null = null
    let loc = {} as Record<UName, WebGLUniformLocation | null>
    const cache = new Float64Array(UNIFORMS.length * 4)
    const idx = {} as Record<UName, number>
    UNIFORMS.forEach((name, i) => { idx[name] = i * 4 })
    const surgeBuf = new Float32Array(MAX_SURGES * 4)

    const f1 = (name: UName, a: number) => {
        const i = idx[name]
        if (cache[i] === a) return
        cache[i] = a
        gl!.uniform1f(loc[name], a)
    }
    const f2 = (name: UName, a: number, b: number) => {
        const i = idx[name]
        if (cache[i] === a && cache[i + 1] === b) return
        cache[i] = a; cache[i + 1] = b
        gl!.uniform2f(loc[name], a, b)
    }
    const f3 = (name: UName, c: RGB) => {
        const i = idx[name]
        if (cache[i] === c[0] && cache[i + 1] === c[1] && cache[i + 2] === c[2]) return
        cache[i] = c[0]; cache[i + 1] = c[1]; cache[i + 2] = c[2]
        gl!.uniform3f(loc[name], c[0], c[1], c[2])
    }
    const f4 = (name: UName, a: number, b: number, c: number, d: number) => {
        const i = idx[name]
        if (cache[i] === a && cache[i + 1] === b && cache[i + 2] === c && cache[i + 3] === d) return
        cache[i] = a; cache[i + 1] = b; cache[i + 2] = c; cache[i + 3] = d
        gl!.uniform4f(loc[name], a, b, c, d)
    }

    const compileShader = (g: WebGL2RenderingContext, kind: number, src: string) => {
        const shader = g.createShader(kind)
        if (!shader) return null
        g.shaderSource(shader, src)
        g.compileShader(shader)
        if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
            if (!g.isContextLost()) console.error('[ZirconTorrent] GLSL compile failed:', g.getShaderInfoLog(shader))
            g.deleteShader(shader)
            return null
        }
        return shader
    }
    const init = () => {
        const g = surface.getContext('webgl2', {
            alpha: false, antialias: false, depth: false, stencil: false,
            powerPreference: 'low-power', preserveDrawingBuffer: false,
        })
        if (!g) {
            console.warn('[ZirconTorrent] WebGL2 is unavailable; showing background only.')
            return false
        }
        gl = g
        const vs = compileShader(g, g.VERTEX_SHADER, VERT)
        const fs = compileShader(g, g.FRAGMENT_SHADER, FRAG)
        if (!vs || !fs) {
            if (vs) g.deleteShader(vs)
            if (fs) g.deleteShader(fs)
            gl = null
            return false
        }
        const p = g.createProgram()
        if (!p) { g.deleteShader(vs); g.deleteShader(fs); gl = null; return false }
        g.attachShader(p, vs); g.attachShader(p, fs)
        g.linkProgram(p)
        g.deleteShader(vs); g.deleteShader(fs)
        if (!g.getProgramParameter(p, g.LINK_STATUS)) {
            if (!g.isContextLost()) console.error('[ZirconTorrent] Shader link failed:', g.getProgramInfoLog(p))
            g.deleteProgram(p)
            gl = null
            return false
        }
        program = p
        g.useProgram(p)
        vertexBuffer = g.createBuffer()
        if (!vertexBuffer) { g.deleteProgram(p); program = null; gl = null; return false }
        g.bindBuffer(g.ARRAY_BUFFER, vertexBuffer)
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
        const pos = g.getAttribLocation(p, 'aPos')
        if (pos >= 0) {
            g.enableVertexAttribArray(pos)
            g.vertexAttribPointer(pos, 2, g.FLOAT, false, 0, 0)
        }
        loc = {} as Record<UName, WebGLUniformLocation | null>
        for (const name of UNIFORMS) loc[name] = g.getUniformLocation(p, name === 'uSurge' ? 'uSurge[0]' : name)
        cache.fill(NaN)
        return true
    }

    let W = 0, H = 0, shown = 1, level = 0, wantW = 0, wantH = 0
    const measureShown = () => {
        const rect = element.getBoundingClientRect()
        if (W > 0 && rect.width > 0) {
            const next = rect.width / W
            if (Math.abs(next - shown) / shown > 0.05) shown = next
        }
    }
    const requestSize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let k = dpr * Math.min(2, Math.max(1, shown)) * LADDER[level]
        const pixels = W * H * k * k
        if (pixels > PIXEL_BUDGET) k *= Math.sqrt(PIXEL_BUDGET / pixels)
        wantW = Math.max(1, Math.round(W * k))
        wantH = Math.max(1, Math.round(H * k))
    }
    const resizeObserver = new ResizeObserver((entries) => {
        const rect = entries[0].contentRect
        W = rect.width; H = rect.height
        measureShown(); requestSize(); dirty = true; wake()
    })
    resizeObserver.observe(element)

    let visible = true
    const intersectionObserver = new IntersectionObserver(entries => {
        visible = entries[entries.length - 1].isIntersecting
        if (visible) wake()
    })
    intersectionObserver.observe(element)
    const onVisibility = () => { if (!document.hidden) wake() }
    document.addEventListener('visibilitychange', onVisibility)

    let cx = 0, cy = 0, moved = false, over = false
    let tu = 0.5, tv = 0.5, mu = 0.5, mv = 0.5, vu = 0, vv = 0
    let hov = 0, scrolled = false, snapNext = true
    const taps: { u: number; v: number; age: number }[] = []
    let sx = 0, svx = 0, steerT = 0, rush = 0
    const onMove = (e: PointerEvent) => {
        if (e.clientX === cx && e.clientY === cy && over) return
        cx = e.clientX; cy = e.clientY
        moved = true
        if (!over) { over = true; snapNext = hov < 0.02 }
        wake()
    }
    const onLeave = () => { over = false; wake() }
    const onDown = (e: PointerEvent) => {
        onMove(e)
        if (e.pointerType !== 'mouse') snapNext = true
        if (!config.value.surge || reduced) return
        // Do not ripple when a visitor activates an actual Hero control.
        if ((e.target as Element | null)?.closest?.('a,button,input,textarea,select,[role="button"]')) return
        const rect = element.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return
        if (taps.length >= MAX_SURGES) taps.shift()
        taps.push({ u: (e.clientX - rect.left) / rect.width, v: (e.clientY - rect.top) / rect.height, age: 0 })
        wake()
    }
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') onLeave() }
    const onScroll = () => { if (over) { scrolled = true; wake() } }
    pointerTarget.addEventListener('pointermove', onMove)
    pointerTarget.addEventListener('pointerdown', onDown)
    pointerTarget.addEventListener('pointerup', onUp)
    pointerTarget.addEventListener('pointercancel', onLeave)
    pointerTarget.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })

    let raf = 0, running = false, lost = false, dirty = true, clock = 0
    let lastTick = -1, lastDraw = -1
    const gaps = new Float64Array(15)
    let gapN = 0
    const sortBuf = new Float64Array(20)
    let cadence = 1000 / 60, every = 1, everyFloor = 1, lateEma = 0, drawnTotal = 0
    const drawGaps = new Float64Array(20)
    let drawN = 0, slowFor = 0, goodFor = 0
    let probe: { from: number; base: number; t: number } | null = null
    let banUntil = 0, climbBanUntil = 0, climbBan = 30000

    const median = (src: Float64Array, n: number) => {
        const m = Math.min(n, src.length)
        for (let i = 0; i < m; i++) sortBuf[i] = src[i]
        const sorted = sortBuf.subarray(0, m).sort()
        return sorted[m >> 1]
    }
    const wake = () => {
        if (running || lost || !gl || !visible || document.hidden || W <= 0 || H <= 0) return
        running = true
        lastTick = -1
        raf = requestAnimationFrame(tick)
    }
    wakeCurrent = () => { dirty = true; wake() }

    const uploadStatic = () => {
        const c = config.value
        for (const [name, color] of c.vecs) f3(name, color)
        for (const [name, value] of c.floats) f1(name, value)
        f1('uZoom', c.zoom)
    }
    const draw = () => {
        const g = gl!
        if (surface.width !== wantW || surface.height !== wantH) {
            surface.width = wantW; surface.height = wantH
        }
        const bw = surface.width, bh = surface.height
        const c = config.value
        uploadStatic()
        const k = W > 0 ? bw / W : 1
        const S = Math.min(H, W / REF_ASPECT)
        const pl = c.placement
        const angle = num(pl.angle, 0, -180, 180) * Math.PI / 180
        const tilt = num(pl.tilt, 0, -60, 60) * Math.PI / 180
        g.viewport(0, 0, bw, bh)
        f2('uRes', bw, bh)
        f1('uUnit', S * k)
        f1('uPx', k)
        f4('uPlaceA', S > 0 ? (num(pl.x, 0, -50, 50) / 100 * W) / S : 0,
            S > 0 ? (-num(pl.y, 0, -50, 50) / 100 * H) / S : 0,
            Math.cos(angle), Math.sin(angle))
        f4('uPlaceB', Math.cos(tilt), Math.sin(tilt), PERSPECTIVE, 0)
        f1('uTime', clock)
        f2('uMouse', mu * bw, (1 - mv) * bh)
        f1('uHover', hov)
        for (let i = 0; i < MAX_SURGES; i++) {
            const tap = taps[i]
            surgeBuf[i * 4] = tap ? tap.u * bw : 0
            surgeBuf[i * 4 + 1] = tap ? (1 - tap.v) * bh : 0
            surgeBuf[i * 4 + 2] = tap ? tap.age : 0
            surgeBuf[i * 4 + 3] = tap ? 1 : 0
        }
        g.uniform4fv(loc.uSurge, surgeBuf)
        f1('uSteer', sx)
        f1('uSwing', Math.max(-1.5, Math.min(1.5, svx)))
        g.drawArrays(g.TRIANGLES, 0, 3)
    }

    const spring = (dt: number) => {
        const w = 5.8 / FOLLOW_S
        let n = Math.ceil(dt / 0.004)
        const h = dt / Math.max(1, n)
        while (n-- > 0) {
            vu += (w * w * (tu - mu) - 2 * w * vu) * h
            vv += (w * w * (tv - mv) - 2 * w * vv) * h
            mu += vu * h; mv += vv * h
        }
        if (Math.abs(tu - mu) < 1e-4 && Math.abs(tv - mv) < 1e-4 && Math.abs(vu) < 1e-3 && Math.abs(vv) < 1e-3) {
            mu = tu; mv = tv; vu = vv = 0
        }
    }
    const ease = (x: number, to: number, dt: number, T: number) => {
        const y = x + (to - x) * (1 - Math.exp(-dt * 4.6 / T))
        return Math.abs(to - y) < 0.004 ? to : y
    }
    const ladder = (now: number, gap: number) => {
        const usual = drawN >= 20 ? median(drawGaps, drawN) : 0
        if (++drawnTotal > 90 && usual > 0) lateEma += ((gap > usual * 1.6 ? 1 : 0) - lateEma) * 0.015
        if (lateEma > 0.02) {
            if (usual < 15.5 && (usual * (every + 1)) / every < 21) {
                everyFloor = every + 1; every = everyFloor
            } else if (level < LADDER.length - 1 && now > banUntil) {
                level++; climbBanUntil = now + climbBan
                climbBan = Math.min(climbBan * 2, 240000)
                requestSize()
            }
            lateEma = 0; drawN = 0; return
        }
        drawGaps[drawN++ % drawGaps.length] = gap
        if (drawN < 30) return
        const target = every * cadence
        const med = median(drawGaps, drawN)
        const late = med > Math.min(Math.max(target * 1.3, 16), 33.4 * 1.3) && med > target + 4
        if (probe) {
            if (now - probe.t > 1500) {
                if (med > probe.base * 0.87) {
                    level = probe.from; banUntil = now + 30000; requestSize()
                } else {
                    climbBanUntil = now + climbBan
                    climbBan = Math.min(climbBan * 2, 240000)
                }
                probe = null
            }
            return
        }
        if (late) {
            goodFor = 0; slowFor += gap
            if (slowFor > 500 && level < LADDER.length - 1 && now > banUntil) {
                probe = { from: level, base: med, t: now }
                level++; slowFor = 0; drawN = 0; requestSize()
            }
        } else {
            slowFor = 0; goodFor += gap
            if (goodFor > 8000 && level > 0 && now > climbBanUntil) {
                level--; goodFor = 0; drawN = 0
                climbBanUntil = now + 3000; requestSize()
            }
        }
    }

    const tick = (now: number) => {
        raf = 0
        if (!gl || lost || !visible || document.hidden) { running = false; return }
        if (lastTick >= 0) {
            const gap = now - lastTick
            if (gap > 0 && gap < 100) gaps[gapN++ % gaps.length] = gap
            if (gapN >= 5) {
                cadence = Math.min(50, Math.max(4, median(gaps, gapN)))
                const x = 16.7 / cadence
                if (x < every - 0.1 || x >= every + 1.1) every = Math.max(1, Math.floor(x + 0.1))
                every = Math.max(every, everyFloor)
            }
        }
        lastTick = now
        const c = config.value
        const flowing = c.speed > 0 && !reduced
        const springing = mu !== tu || mv !== tv || hov !== (over ? 1 : 0)
        const surging = taps.length > 0 || sx !== steerT || svx !== 0 || rush !== (over ? 1 : 0)
        if (!dirty && !flowing && !springing && !surging && !moved && !scrolled) {
            running = false; lastDraw = -1; return
        }
        raf = requestAnimationFrame(tick)
        if (lastDraw >= 0 && now - lastDraw < (every - 0.5) * cadence) return
        const dt = lastDraw < 0 ? 1 / 60 : Math.min(0.1, (now - lastDraw) / 1000)
        if (lastDraw >= 0) ladder(now, now - lastDraw)
        lastDraw = now

        if (moved || scrolled) {
            const rect = element.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
                tu = (cx - rect.left) / rect.width
                tv = (cy - rect.top) / rect.height
                if (W > 0) {
                    const s = rect.width / W
                    if (Math.abs(s - shown) / shown > 0.05) { shown = s; requestSize() }
                }
            }
            if (snapNext) { mu = tu; mv = tv; vu = vv = 0; snapNext = false }
            moved = scrolled = false
        }
        spring(dt)
        hov = ease(hov, over ? 1 : 0, dt, FOLLOW_S * 2)
        const S = Math.min(H, W / REF_ASPECT)
        const offset = S > 0 ? ((num(c.placement.x, 0, -50, 50) / 100) * W) / S : 0
        steerT = over && S > 0
            ? Math.max(-0.9, Math.min(0.9, (((mu - 0.5) * W) / S - offset) / c.zoom)) * Math.min(1, c.hover)
            : 0
        const sw = SWING_W * Math.max(0.6, Math.min(1.4, c.hover))
        let n = Math.ceil(dt / 0.004)
        const h = dt / Math.max(1, n)
        while (n-- > 0) {
            svx += (sw * sw * (steerT - sx) - 2 * SWING_Z * sw * svx) * h
            sx += svx * h
        }
        if (Math.abs(steerT - sx) < 1e-4 && Math.abs(svx) < 1e-3) { sx = steerT; svx = 0 }
        rush = ease(rush, over ? 1 : 0, dt, RUSH_S)
        if (flowing) clock = (clock + dt * (c.speed / 50) * (1 + c.hoverSpeed * rush)) % 3600
        for (let i = taps.length - 1; i >= 0; i--) {
            taps[i].age += dt
            if (taps[i].age > SURGE_LIFE) taps.splice(i, 1)
        }
        dirty = false
        draw()
    }

    const onLost = (e: Event) => {
        e.preventDefault()
        lost = true
        if (raf) cancelAnimationFrame(raf)
        raf = 0; running = false
    }
    const onRestored = () => { lost = false; if (init()) { dirty = true; wake() } }
    surface.addEventListener('webglcontextlost', onLost)
    surface.addEventListener('webglcontextrestored', onRestored)
    if (init()) wake()

    // Everything, including GPU resources, is released when Vue unmounts.
    cleanupCurrent = () => {
        if (raf) cancelAnimationFrame(raf)
        running = false; wakeCurrent = null
        resizeObserver.disconnect(); intersectionObserver.disconnect()
        document.removeEventListener('visibilitychange', onVisibility)
        reducedQuery?.removeEventListener('change', onReduced)
        pointerTarget.removeEventListener('pointermove', onMove)
        pointerTarget.removeEventListener('pointerdown', onDown)
        pointerTarget.removeEventListener('pointerup', onUp)
        pointerTarget.removeEventListener('pointercancel', onLeave)
        pointerTarget.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('scroll', onScroll, { capture: true })
        surface.removeEventListener('webglcontextlost', onLost)
        surface.removeEventListener('webglcontextrestored', onRestored)
        if (gl && !gl.isContextLost()) {
            if (vertexBuffer) gl.deleteBuffer(vertexBuffer)
            if (program) gl.deleteProgram(program)
        }
    }
})

onUnmounted(() => { cleanupCurrent?.(); cleanupCurrent = null; stopWatch(); wakeCurrent = null })
</script>

<template>
    <div
        ref="root"
        class="zircon-torrent"
        :class="{ 'zircon-torrent--passive': trackParent }"
        :style="{ backgroundColor: background }"
        aria-hidden="true"
    >
        <canvas ref="canvas" class="zircon-torrent__canvas" />
    </div>
</template>

<style scoped>
.zircon-torrent {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    touch-action: pan-y;
}
.zircon-torrent--passive { pointer-events: none; }
.zircon-torrent__canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
}
</style>
