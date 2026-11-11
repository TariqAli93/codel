import type { ZirconTorrentProps } from './ZirconTorrent.vue'

export type RGB = [number, number, number]
export type Placement = { x: number; y: number; angle: number; tilt: number }
export type Direction = {
    flow: 'down' | 'up'
    ripple: 'away' | 'toward'
    streaks: 'away' | 'toward'
}

export const DEFAULT_ADVANCED = {
    horizon: 73,
    coreWidth: 25,
    sheathWidth: 72,
    flare: 100,
    lineWidth: 100,
    strandContrast: 75,
    dashLength: 30,
    dashBoost: 90,
    flowCycles: 4,
    sway: 15,
    breathe: 10,
    bloomWidth: 300,
    bloomColor: 'var(--accent)',
    horizonColor: 'var(--text)',
    floorTop: 'var(--accent-subtle)',
    floorDeep: 'var(--bg)',
    causticColor: 'var(--accent)',
    causticScale: 80,
    ripple: 100,
    streakCount: 12,
    streakOpacity: 70,
    reflection: 100,
    sparkles: 12,
    sparkleColor: 'var(--accent)',
    specks: 10,
    lift: 100,
    lean: 0,
    grain: 20,
    vignette: 0,
}
export type Advanced = typeof DEFAULT_ADVANCED

// Every colour is one of the site's tokens (app/assets/scss/main.scss); the component reads what each
// computes to where it sits, so the effect follows the theme around it.
export const DEFAULTS = {
    background: 'var(--bg)',
    baseColor: 'var(--accent)',
    accentColor: 'var(--text)',
    strands: 400,
    glow: 100,
    floor: 100,
    scale: 300,
    zoom: 50,
    hover: 19,
    hoverSpeed: 100,
    surge: true,
    speed: 74,
    trackParent: false,
}
export const DEFAULT_PLACEMENT: Placement = { x: 0, y: 0, angle: 0, tilt: 0 }
export const DEFAULT_DIRECTION: Direction = { flow: 'down', ripple: 'away', streaks: 'away' }

export const UNIFORMS = [
    'uRes', 'uUnit', 'uPx', 'uPlaceA', 'uPlaceB', 'uZoom', 'uTime', 'uMouse', 'uHover',
    'uSurge', 'uSteer', 'uSwing', 'uBg', 'uKBlue', 'uKPale', 'uKHalo', 'uKCore',
    'uKBloom', 'uKHorizon', 'uKCaustic', 'uKCausticDeep', 'uKStreak', 'uKSpark',
    'uKSpeck', 'uEFloorTop', 'uEFloorDeep', 'uScale', 'uHoverAmt', 'uStrands',
    'uStrandMean', 'uFlowDir', 'uRippleDir', 'uStreakDir', 'uColReach', 'uGlow',
    'uFloor', 'uHorizon', 'uCoreW', 'uSheathW', 'uFlare', 'uLine', 'uContrast',
    'uDashLen', 'uDashBoost', 'uFlow', 'uSway', 'uBreathe', 'uBloomW', 'uCausticScale',
    'uRipple', 'uStreaks', 'uStreakOp', 'uReflect', 'uSparkles', 'uSpecks', 'uLift',
    'uLean', 'uGrain', 'uVignette',
] as const
export type UName = (typeof UNIFORMS)[number]

export interface Config {
    placement: Placement
    zoom: number
    surge: boolean
    speed: number
    hover: number
    hoverSpeed: number
    vecs: [UName, RGB][]
    floats: [UName, number][]
}

export const num = (v: unknown, d: number, lo = -Infinity, hi = Infinity) =>
    Math.min(hi, Math.max(lo, typeof v === 'number' && Number.isFinite(v) ? v : d))

const colorCache = new Map<string, RGB | null>()
export function parseColor(input: unknown, fallback: RGB): RGB {
    if (typeof input !== 'string') return fallback
    let hit = colorCache.get(input)
    if (hit === undefined) {
        hit = parseColorRaw(input)
        colorCache.set(input, hit)
    }
    return hit ?? fallback
}
function parseColorRaw(raw: string): RGB | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (s[0] === '#') {
        const h = s.slice(1)
        const x = (a: string) => parseInt(a, 16) / 255
        let out: RGB
        if (h.length === 3 || h.length === 4) out = [x(h[0] + h[0]), x(h[1] + h[1]), x(h[2] + h[2])]
        else if (h.length === 6 || h.length === 8) out = [x(h.slice(0, 2)), x(h.slice(2, 4)), x(h.slice(4, 6))]
        else return null
        return out.every(Number.isFinite) ? out : null
    }
    // What a browser computes a color-mix() token to.
    const srgb = /^color\(\s*srgb\s+([^)]*)\)$/i.exec(s)
    if (srgb) {
        const c = srgb[1].split(/[\s/]+/).filter(Boolean).slice(0, 3).map(Number)
        return c.length === 3 && c.every(Number.isFinite) ? (c.map(v => Math.min(1, Math.max(0, v))) as RGB) : null
    }
    const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
    if (!m) return null
    const parts = m[2].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const n = (p: string, scale: number) => p.endsWith('%') ? (parseFloat(p) / 100) * scale : parseFloat(p)
    let rgb: RGB
    if (m[1].toLowerCase().startsWith('rgb')) {
        rgb = [n(parts[0], 255) / 255, n(parts[1], 255) / 255, n(parts[2], 255) / 255]
    } else {
        const h = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
        const s = n(parts[1], 1), l = n(parts[2], 1)
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        const f = (t: number) => {
            t = (t + 1) % 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        rgb = [f(h + 1 / 3), f(h), f(h - 1 / 3)]
    }
    return rgb.every(Number.isFinite) ? (rgb.map(c => Math.min(1, Math.max(0, c))) as RGB) : null
}

const energy = (v: number) => -Math.log(Math.max(1e-3, 1 - Math.min(v, 0.97)))
const energyOf = (c: RGB, gain = 1): RGB => [energy(c[0]) * gain, energy(c[1]) * gain, energy(c[2]) * gain]
function chromaOf(c: RGB, k = 1, gain = 1): RGB {
    const e = energyOf(c)
    const m = Math.max(e[0], e[1], e[2], 1e-3)
    return [Math.pow(e[0] / m, k) * gain, Math.pow(e[1] / m, k) * gain, Math.pow(e[2] / m, k) * gain]
}
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** `read` turns a CSS colour (`var(--accent)`) into one parseColor understands, such as `rgb()`. */
export function resolve(p: ZirconTorrentProps, read: (css: string) => string = css => css): Config {
    const parse = (input: unknown, fallback: RGB) => parseColor(typeof input === 'string' ? read(input) : input, fallback)
    const legacy = (p.advanced as { hover?: number } | undefined)?.hover
    const a = { ...DEFAULT_ADVANCED, ...(p.advanced ?? {}) }
    const base = parse(p.baseColor ?? DEFAULTS.baseColor, [0.31, 0.6, 0.82])
    const accent = parse(p.accentColor ?? DEFAULTS.accentColor, [0.84, 0.95, 0.97])
    const contrast = num(a.strandContrast, 75, 0, 100) / 100
    const dashLen = num(a.dashLength, 30, 2, 95) / 100
    const dashBoost = num(a.dashBoost, 90, 0, 400) / 100
    const strandMean = (1 + (0.25 + 3 / 7 - 1) * contrast) * (0.55 + dashBoost * Math.max(0.01, 0.675 * dashLen - 0.025))
    const dir = { ...DEFAULT_DIRECTION, ...(p.direction ?? {}) }
    const beam = num(p.scale, DEFAULTS.scale, 10, 300) / 100
    const sheath = num(a.sheathWidth, 72, 20, 400) / 2000
    const flare = num(a.flare, 100, 0, 300) / 100
    const reach = beam * Math.max(0.45, sheath * (0.8 + 1.85 * flare) * 2.6 + 0.08) + 0.06
    return {
        placement: { ...DEFAULT_PLACEMENT, ...(p.placement ?? {}) },
        zoom: num(p.zoom, DEFAULTS.zoom, 30, 100) / 100,
        surge: p.surge ?? DEFAULTS.surge,
        speed: num(p.speed, DEFAULTS.speed, 0, 100),
        hover: num(p.hover ?? legacy, DEFAULTS.hover, 0, 100) / 50,
        hoverSpeed: num(p.hoverSpeed, DEFAULTS.hoverSpeed, 0, 300) / 100,
        vecs: [
            ['uBg', parse(p.background ?? DEFAULTS.background, [0, 0.004, 0.02])],
            ['uKBlue', chromaOf(base, 1.15)],
            ['uKPale', chromaOf(mixRGB(base, accent, 0.5))],
            ['uKHalo', chromaOf(base, 3.5)],
            ['uKCore', mixRGB([1, 1, 1], chromaOf(accent), 0.25)],
            ['uKBloom', chromaOf(parse(a.bloomColor, [0.5, 0.72, 1]))],
            ['uKHorizon', chromaOf(parse(a.horizonColor, [0.81, 0.89, 1]), 1, 1.5)],
            ['uKCaustic', chromaOf(parse(a.causticColor, [0.33, 0.59, 0.83]))],
            ['uKCausticDeep', chromaOf(parse(a.causticColor, [0.33, 0.59, 0.83]), 1.5)],
            ['uKStreak', chromaOf(mixRGB(base, accent, 0.2), 1, 0.9)],
            ['uKSpark', chromaOf(parse(a.sparkleColor, [0.62, 0.89, 1]))],
            ['uKSpeck', chromaOf(mixRGB(base, accent, 0.5), 1, 0.6)],
            ['uEFloorTop', energyOf(parse(a.floorTop, [0.04, 0.1, 0.23]))],
            ['uEFloorDeep', energyOf(parse(a.floorDeep, [0.01, 0.02, 0.06]))],
        ],
        floats: [
            ['uScale', beam],
            ['uHoverAmt', num(p.hover ?? legacy, DEFAULTS.hover, 0, 100) / 50],
            ['uStrands', num(p.strands, DEFAULTS.strands, 50, 400) / 16],
            ['uStrandMean', strandMean],
            ['uFlowDir', dir.flow === 'up' ? -1 : 1],
            ['uRippleDir', dir.ripple === 'toward' ? -1 : 1],
            ['uStreakDir', dir.streaks === 'toward' ? -1 : 1],
            ['uColReach', reach],
            ['uGlow', num(p.glow, DEFAULTS.glow, 0, 100) / 70],
            ['uFloor', num(p.floor, DEFAULTS.floor, 0, 100) / 60],
            ['uHorizon', 1 - num(a.horizon, 73, 40, 95) / 100],
            ['uCoreW', num(a.coreWidth, 25, 2, 200) / 2000],
            ['uSheathW', sheath],
            ['uFlare', flare],
            ['uLine', num(a.lineWidth, 100, 20, 500) / 100],
            ['uContrast', contrast],
            ['uDashLen', dashLen],
            ['uDashBoost', dashBoost],
            ['uFlow', Math.round(num(a.flowCycles, 4, 1, 12))],
            ['uSway', num(a.sway, 15, 0, 25) / 100],
            ['uBreathe', num(a.breathe, 10, 0, 50) / 100],
            ['uBloomW', num(a.bloomWidth, 300, 50, 600) / 2000],
            ['uCausticScale', num(a.causticScale, 80, 25, 400) / 100],
            ['uRipple', num(a.ripple, 100, 0, 300) / 100],
            ['uStreaks', num(a.streakCount, 12, 2, 40)],
            ['uStreakOp', num(a.streakOpacity, 70, 0, 100) / 100],
            ['uReflect', num(a.reflection, 100, 0, 200) / 100],
            ['uSparkles', num(a.sparkles, 12, 0, 50)],
            ['uSpecks', num(a.specks, 10, 0, 40)],
            ['uLift', num(a.lift, 100, 0, 200) / 100],
            ['uLean', num(a.lean, 0, 0, 60) / 1000],
            ['uGrain', num(a.grain, 20, 0, 100) / 100],
            ['uVignette', num(a.vignette, 0, 0, 100) / 100],
        ],
    }
}
