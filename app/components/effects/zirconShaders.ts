/** Original WebGL2 shaders ported unchanged from the Framer component. */
export const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

export const FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uUnit;
uniform float uPx;
uniform vec4 uPlaceA;
uniform vec4 uPlaceB;
uniform float uZoom;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec4 uSurge[4];
uniform float uSteer;
uniform float uSwing;
uniform vec3 uBg;
uniform vec3 uKBlue;
uniform vec3 uKPale;
uniform vec3 uKHalo;
uniform vec3 uKCore;
uniform vec3 uKBloom;
uniform vec3 uKHorizon;
uniform vec3 uKCaustic;
uniform vec3 uKCausticDeep;
uniform vec3 uKStreak;
uniform vec3 uKSpark;
uniform vec3 uKSpeck;
uniform vec3 uEFloorTop;
uniform vec3 uEFloorDeep;
uniform float uScale;
uniform float uHoverAmt;
uniform float uStrands;
uniform float uStrandMean;
uniform float uFlowDir;
uniform float uRippleDir;
uniform float uStreakDir;
uniform float uColReach;
uniform float uGlow;
uniform float uFloor;
uniform float uHorizon;
uniform float uCoreW;
uniform float uSheathW;
uniform float uFlare;
uniform float uLine;
uniform float uContrast;
uniform float uDashLen;
uniform float uDashBoost;
uniform float uFlow;
uniform float uSway;
uniform float uBreathe;
uniform float uBloomW;
uniform float uCausticScale;
uniform float uRipple;
uniform float uStreaks;
uniform float uStreakOp;
uniform float uReflect;
uniform float uSparkles;
uniform float uSpecks;
uniform float uLift;
uniform float uLean;
uniform float uGrain;
uniform float uVignette;
out vec4 outColor;

const float TAU = 6.2831853;
const float FLARE_L = 0.09;
const float FLARE_A = 2.0;
const float FOOT_L = 0.05;
const float CORE_L = 0.065;
const float COL_LEAN = 0.008;
const float HALO_W = 0.1;
const float REFL_D = 0.08;
const float REFL_SQ = 2.2;
const float FALL_A = 12.85;
const float FALL_B = 40.0;
const float SURGE_V = 1.1;
const float RING_V = 0.32;
const float GATHER_T = 1.8;
const float RING_GATHER = 0.9;

float sq(float x) { return x * x; }
float h11(float n) { n = fract(n * 0.1031); n *= n + 33.33; n *= n + n; return fract(n); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbmAA(vec2 p, float fpx) {
    float s = 0.0, a = 0.5, n = 0.0;
    for (int i = 0; i < 4; i++) {
        float k = clamp((0.45 - fpx) * 4.0, 0.0, 1.0);
        s += a * mix(0.5, vnoise(p), k);
        n += a;
        p = mat2(1.62, 1.18, -1.18, 1.62) * p + 7.1;
        fpx *= 2.03;
        a *= 0.5;
    }
    return s / n;
}
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h11(i), h11(i + 1.0), f); }
float asinhS(float v) { float a = abs(v); return sign(v) * log(a + sqrt(a * a + 1.0)); }

vec2 toWorld(vec2 frag, out float ok) {
    vec2 p = (frag - 0.5 * uRes) / uUnit - uPlaceA.xy;
    p = vec2(uPlaceA.z * p.x - uPlaceA.w * p.y, uPlaceA.w * p.x + uPlaceA.z * p.y);
    float D = uPlaceB.z;
    float den = D * uPlaceB.x - p.y * uPlaceB.y;
    ok = step(1e-3, den);
    float t = D * uPlaceB.x / max(den, 1e-3);
    p = vec2(t * p.x, t * p.y * uPlaceB.x - D * (1.0 - t) * uPlaceB.y);
    return p / uZoom;
}

float strands(float u, float lanes, float cellPx, float sig, float seed, float P, float t) {
    float v = u * lanes;
    float cell = floor(v);
    float sum = 0.0;
    for (int k = -1; k <= 1; k++) {
        float i = cell + float(k);
        float h = h11(i * 1.731 + seed);
        float h2 = h11(i * 3.117 + seed + 9.1);
        float h3 = h11(i * 0.913 + seed + 21.7);
        float c = i + 0.5 + (h2 - 0.5) * 0.5 + uSway * sin(TAU * t / 6.0 + h3 * TAU);
        float dpx = (v - c) * cellPx;
        float ln = exp(-(dpx * dpx) / max(sig * sig, 1e-4));
        float h6 = h * h * h; h6 *= h6;
        float cyc = max(1.0, uFlow + floor(h3 * 3.0) - 1.0);
        float along = P - uFlowDir * t * cyc / 15.0;
        float lvl = mix(1.0, (0.25 + 3.0 * h6) * (0.4 + 1.2 * n1(along * 5.0 + h3 * 17.0)), uContrast);
        float q = fract(P * 2.5 - uFlowDir * t * cyc / 6.0 + h2 * 7.0);
        float dash = smoothstep(0.0, 0.05, q) * (1.0 - smoothstep(uDashLen * 0.35, max(uDashLen, 0.02), q));
        sum += ln * lvl * (0.55 + uDashBoost * dash);
    }
    return sum * clamp(cellPx / max(sig * 1.7725, 1e-3), 0.0, 2.5);
}

vec3 column(float x, float d, float pxu, float sig, float P, float t, float br) {
    float fl = exp(-d / FLARE_L);
    float foot = exp(-d / FOOT_L);
    float w = uSheathW * (0.8 + uFlare * FLARE_A * fl) * (x < 0.0 ? 1.04 : 1.0);
    float u = x / w;
    float au = abs(u);
    vec3 E = vec3(0.0);
    if (au < 2.6) {
        float env = exp(-pow(au, 2.0 + 1.5 * foot));
        float wpx = w * pxu;
        float lanes = max(min(uStrands, wpx / max(sig * 0.8, 1e-3)), 1.0);
        float lanes2 = lanes * 0.61;
        float lanes3 = max(min(uStrands * 2.7, wpx / max(sig * 0.8, 1e-3)), 1.0);
        float s = strands(u, lanes, wpx / lanes, sig, 0.0, P, t) * 0.45
                + strands(u, lanes2, wpx / lanes2, sig, 37.0, P, t) * 0.25
                + strands(u, lanes3, wpx / lanes3, sig, 71.0, P, t) * 0.3;
        s /= uStrandMean;
        float sa = mix(0.3, 0.65, smoothstep(0.25, 1.3, au));
        float eb = 3.1 * (1.0 + 0.5 * foot) * env * mix(1.0, s, sa);
        E += mix(uKBlue, uKPale, max(0.65 * foot, 0.75 * smoothstep(1.2, 4.5, eb))) * eb;
    }
    E += uKHalo * 0.28 * uLift * exp(-pow(abs(x) / (HALO_W * (1.0 + 0.3 * fl)), 1.5)) * br;
    float cw = uCoreW * (1.0 + uFlare * 5.0 * exp(-d / CORE_L)) * (1.0 + (br - 1.0) * 0.8);
    float cx = x / cw;
    E += uKCore * 4.0 * uGlow * br * exp(-cx * cx);
    E += uKBloom * 0.9 * uGlow * br * exp(-sq(cx / 2.4));
    return E;
}

vec3 finish(vec3 col) {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 vq = (uv - 0.5) * vec2(uRes.x / uRes.y / 1.5, 1.0) * 1.6;
    col *= 1.0 - uVignette * smoothstep(0.35, 1.1, length(vq));
    float fr = mod(floor(uTime * 24.0), 48.0);
    float gr = h21(floor(gl_FragCoord.xy / max(uPx, 1.0)) + vec2(fr * 17.0, fr * 31.0)) - 0.5;
    float v = max(col.b, col.g);
    col += gr * uGrain * 0.12 * sqrt(v + 0.004) * (1.0 - 0.85 * v * v);
    return clamp(col, 0.0, 1.0);
}

void main() {
    float ok;
    vec2 wp = toWorld(gl_FragCoord.xy, ok);
    if (ok < 0.5) { outColor = vec4(finish(uBg), 1.0); return; }
    float okm;
    vec2 mw = toWorld(uMouse, okm);
    float x = wp.x;
    float y = wp.y + 0.5;
    float t = uTime;
    float pxH = uUnit * uZoom;
    float sig = max(0.75 * uLine * uPx, 0.9);
    float yH = uHorizon;
    float sc = max(uScale, 0.05);
    float xs = x / sc;
    float br = 1.0 + uBreathe * 0.5 * (cos(TAU * t / 3.0) - 1.0);
    float hv = uHover * uHoverAmt * okm;
    vec2 m = vec2(mw.x, mw.y + 0.5);
    float d = y - yH;
    float topD = max(1.0 - yH, 1e-3);
    vec3 E = vec3(0.0);

    float pulse = 0.0;
    float pk = 0.0;
    float flash = 0.0;
    vec3 SPL = vec3(0.0);
    float xq = x - uSteer;
    vec4 ring[4];
    for (int i = 0; i < 4; i++) {
        vec4 s = uSurge[i];
        ring[i] = vec4(0.0, 0.0, -1.0, 0.0);
        if (s.w < 0.5) continue;
        float okt;
        vec2 tw = toWorld(s.xy, okt);
        float ty = tw.y + 0.5;
        if (ty > yH) {
            float fall = uFlowDir > 0.0 ? (ty - yH) / SURGE_V : 1e3;
            float yp = ty - uFlowDir * SURGE_V * s.z;
            if (s.z < fall) {
                float behind = (y - yp) * uFlowDir;
                float on = smoothstep(0.0, 0.15, s.z);
                pulse += (behind > 0.0 ? exp(-behind / 0.25) : 0.0) * on * 0.6;
                pk += exp(-sq(behind / 0.03)) * on;
            } else {
                float a = s.z - fall;
                flash += exp(-a / 0.4) * smoothstep(0.0, 0.03, a);
                pulse += exp(-max(y - yH, 0.0) / 0.25) * exp(-a / 0.25) * 0.6;
                float hgt = 0.09 * sqrt(clamp(a / 0.5, 0.0, 1.0));
                float fade = exp(-a / 0.35) * smoothstep(0.0, 0.04, a);
                float wq = (0.03 + 0.25 * a) * max(uScale, 0.05);
                SPL += uKPale * 2.2 * fade * exp(-sq(xq / wq))
                     * exp(-(d > 0.0 ? d / max(hgt, 0.004) : -d / 0.02));
                if (uRippleDir < 0.0) ring[i] = vec4(uSteer, yH - 0.02, a * RING_V, exp(-a / 1.6) * smoothstep(0.0, 0.1, a));
            }
            if (uRippleDir > 0.0 && s.z < GATHER_T) {
                float k = s.z / GATHER_T;
                ring[i] = vec4(uSteer, yH - 0.02, RING_GATHER * (1.0 - k), smoothstep(0.0, 0.15, s.z) * (1.0 - smoothstep(0.85, 1.0, k)));
            }
        } else if (okt > 0.5) {
            ring[i] = vec4(tw.x, ty, s.z * RING_V * 0.8, exp(-s.z / 1.4) * smoothstep(0.0, 0.05, s.z));
        }
    }

    float xr = x - clamp(x, min(0.0, uSteer), max(0.0, uSteer));
    if (d > -REFL_D && abs(xr) < uColReach + 0.12 * abs(uSwing)) {
        float dd = d >= 0.0 ? d : -d * REFL_SQ;
        float yc = yH + dd;
        float xa = x;
        float leanAmt = clamp(m.x / 0.6, -1.0, 1.0) * uLean * hv;
        float shp = pow(1.0 - clamp(dd / topD, 0.0, 1.0), 1.6);
        float aim = uSteer * shp - uSwing * 0.4 * shp * (1.0 - shp);
        xa -= COL_LEAN * min(dd / 0.7, 1.0) + leanAmt * pow(clamp(dd / topD, 0.0, 1.0), 1.5) + aim;
        xa /= 1.0 + 0.35 * pk;
        vec3 C = column(xa / sc, dd, pxH * sc, sig, 1.0 - yc, t, br);
        C *= 1.0 + 1.2 * pulse + 2.2 * pk;
        float below = clamp(-d * pxH, 0.0, 1.0);
        float wet = 0.45 + 1.1 * vnoise(vec2(x * 45.0, log(max(-d, 1e-4)) * 16.0));
        E += C * mix(1.0, 0.45 * uReflect * exp(d / 0.035) * wet, below);
    }

    float xp = (x - uSteer) / sc;
    float bw = uBloomW * (1.0 + (br - 1.0) * 0.8);
    float pb = br * uGlow * (1.0 + 1.2 * flash);
    E += uKCore * 2.5 * pb * exp(-sq(xp / (bw * 0.45)) - sq(d / (d > 0.0 ? 0.01 : 0.03)));
    E += uKPale * 0.3 * pb * exp(-sq(xp / bw) - sq(d / 0.02));
    E += SPL;
    E += uKHorizon * 0.3 * exp(-sq(d / 0.015) - sq(xp / 0.2)) * mix(1.0, uFloor, 0.5);
    E += uKCaustic * 0.22 * exp(-abs(d) / (d > 0.0 ? 0.018 : 0.03))
       * (0.35 + 0.65 * exp(-sq((x - uSteer) / 0.6))) * clamp(uFloor * 2.5, 0.2, 1.5);

    if (d < 0.0) {
        float dy = -d;
        float id = 1.0 / max(dy, 1e-4);
        float A = asinhS(x * id);
        float B = -log(max(dy, 1e-4));
        float rate = id / pxH;
        float flow = t * 0.16 * uRipple * uRippleDir;
        float xl = x - uSteer;
        float lat = 0.85 * exp(-sq(xp / (0.19 + 0.3 * dy))) + 0.06 * exp(-abs(xp) / 0.4);
        float fu = max(dy - 0.03, 0.0);
        float il = 4.5 * exp(-FALL_A * fu - FALL_B * fu * fu) * lat;

        float pw = 0.25 / (1.0 + 3.0 * dy);
        vec2 q = vec2(x / pw * 2.0, 5.5 * (flow - B - 3.0 * abs(x))) * uCausticScale;
        q.x += (vnoise(q * vec2(0.2, 0.3) + 5.3) - 0.5) * 1.6;
        q = mat2(0.8, 0.6, -0.6, 0.8) * q;
        float fpx = max(5.5 * rate, 2.0 / (pw * pxH)) * uCausticScale;
        float T = fbmAA(q, fpx);
        float Tc = smoothstep(0.4, 0.88, T);
        float patchF = mix(1.0, 0.55 + 2.2 * Tc, clamp((0.45 - fpx) * 4.0, 0.0, 1.0));
        float lv = log2(1.0 / (1.8 * uPx * rate));
        float o0 = floor(lv);
        float f0 = exp2(o0);
        float fb = fract(lv);
        float BF = B;
        vec2 k0 = vec2(o0 * 7.7, o0 * 3.1);
        vec2 k1 = k0 + vec2(7.7, 3.1);
        float wA = mix(vnoise(vec2(A * f0, BF * f0 * 0.33) + k0), vnoise(vec2(A * f0 * 2.0, BF * f0 * 0.66) + k1), fb);
        float wB = mix(vnoise(vec2(A * f0 * 0.33, BF * f0) - k0), vnoise(vec2(A * f0 * 0.66, BF * f0 * 2.0) - k1), fb);
        float ray = smoothstep(0.02, 0.12, dy);
        wA = smoothstep(0.28, 0.72, wA);
        wB = smoothstep(0.28, 0.72, wB);
        float mid = exp(-sq((dy - 0.07) / 0.06));
        float speck = h21(floor(gl_FragCoord.xy / max(uPx, 1.0)) + 17.0) - 0.5;
        float weave = 1.0 + (0.4 + 0.25 * mid) * ray * (wA - 0.5) + (0.2 + 0.2 * (1.0 - ray) + 0.2 * mid) * (wB - 0.5) + 0.12 * speck;

        float rp = 0.0;
        for (int i = 0; i < 4; i++) {
            vec4 r = ring[i];
            if (r.z < 0.0) continue;
            float dy0 = max(yH - r.y, 0.002);
            vec2 fq = vec2(x * id - r.x / dy0, id - 1.0 / dy0) * dy0;
            float rr = length(fq);
            float wdt = 0.012 + 0.08 * r.z;
            rp += r.w * (exp(-sq((rr - r.z) / wdt)) + 0.45 * exp(-sq((rr - 0.6 * r.z) / (wdt * 0.8))));
        }

        float near = exp(-dy / 0.05);
        float bk = clamp((0.45 - 45.0 * rate) * 4.0, 0.0, 1.0);
        float brush = 0.6 * vnoise(vec2(x * 14.0, (B - flow) * 22.0)) + 0.4 * vnoise(vec2(x * 33.0 + 4.1, (B - flow) * 45.0));
        float brushF = mix(1.0, 0.35 + 1.5 * smoothstep(0.3, 0.75, brush), near * bk);
        float fe = il * patchF * brushF * max(weave, 0.0) * (1.0 + 3.5 * rp);
        vec3 Ef = mix(uKCausticDeep, uKCaustic, smoothstep(0.0, 2.0, fe)) * fe + vec3(0.35) * max(fe - 2.5, 0.0);
        Ef += mix(uEFloorTop, uEFloorDeep, smoothstep(0.0, 0.2, dy)) * max(weave, 0.0);

        float rw = 0.06 + 0.5 * dy;
        Ef += uKPale * 2.0 * exp(-sq((xp + (Tc - 0.5) * 0.04) / rw) - dy / 0.07) * (0.5 + Tc) * br * uReflect;

        float sv = asinhS(xl * id) * uStreaks;
        float scell = dy * pxH / max(uStreaks, 1.0);
        float sci = floor(sv);
        float st = 0.0;
        for (int k = -1; k <= 1; k++) {
            float i = sci + float(k);
            float hp = h11(i * 2.371 + 51.0);
            float hc = h11(i * 5.113 + 13.0);
            float dpx = (sv - (i + 0.2 + 0.6 * hc)) * scell;
            float sw = max(sig * 1.6, 1.0);
            float ln = exp(-sq(dpx / sw)) + 0.12 * exp(-abs(dpx) / (sw * 2.5));
            float run = smoothstep(0.55, 0.9, n1(B * 6.0 + hp * 31.0));
            float qq = fract((B - t * 0.16 * uRipple * uStreakDir) * 0.7 + hp * 5.0);
            float pu = smoothstep(0.0, 0.1, qq) * (1.0 - smoothstep(0.2, 0.5, qq));
            st += step(0.4, hp) * ln * run * (0.3 + 0.7 * hc) * (0.6 + 0.9 * pu);
        }
        st *= smoothstep(0.06, 0.16, dy) * exp(-sq(xl / (0.2 + 0.7 * dy))) * exp(-dy / 0.3);
        Ef += uKStreak * st * uStreakOp * (1.0 + 2.0 * rp);
        Ef *= uFloor;

        float fk = clamp(uFloor * 2.5, 0.0, 1.5);
        Ef += (uKPale * 1.2 + uKBloom * 0.5) * rp * clamp(uFloor * 2.5, 0.5, 1.5);
        Ef += uKCaustic * 0.45 * fk * exp(-sq(xl / (0.3 + 1.1 * dy)) - dy / 0.14);
        float wob = (vnoise(vec2(B * 7.0 - t * 0.6, 3.1)) - 0.5) * 0.12 * dy;
        float rph = B * 55.0 - t * 2.4 * uRipple + 6.0 * vnoise(vec2(x * 18.0, B * 6.0));
        float rib = mix(0.5, 0.5 + 0.5 * sin(rph), clamp(1.0 - 55.0 * rate, 0.0, 1.0));
        float rw2 = (0.02 + 0.1 * dy) * sc;
        Ef += uKPale * 1.1 * uReflect * br * exp(-sq((xl + wob) / rw2) - dy / 0.2) * (0.3 + 0.7 * rib);

        vec2 fcell = vec2(0.35, 0.6);
        vec2 gi = floor(vec2(x * id, id) / fcell);
        float hs = h21(gi + 11.3);
        vec2 cp = (gi + 0.2 + 0.6 * vec2(h21(gi + 3.7), h21(gi + 5.9))) * fcell;
        float cdy = 1.0 / max(cp.y, 1e-3);
        vec2 gc = vec2(cp.x * cdy, cdy);
        float reachL = exp(-sq((gc.x - uSteer) / (0.22 + 0.9 * gc.y)));
        float sow = smoothstep(0.05, 0.09, gc.y) * (1.0 - smoothstep(0.3, 0.55, gc.y)) * reachL;
        if (hs < uSparkles * 0.02 * sow) {
            float dpx = length(vec2(x - gc.x, dy - gc.y)) * pxH;
            float sz = (0.6 + 0.5 * h21(gi + 8.1)) * uPx * (0.7 + 2.0 * gc.y);
            float kk = 3.0 + floor(h21(gi + 2.2) * 3.0);
            float tw = pow(max(0.5 + 0.5 * sin(TAU * kk * t / 6.0 + hs * 97.0), 0.0), 6.0);
            float dotv = exp(-sq(dpx / sz)) + 0.1 * exp(-dpx / (sz * 2.5));
            Ef += uKSpark * dotv * (0.25 + 3.0 * tw) * (1.0 + 2.0 * rp) * (0.4 + 0.6 * reachL) * min(uFloor, 1.5);
        }
        E = mix(E, E + Ef, smoothstep(0.0, 1.0, dy * pxH / (8.0 * uPx)));
    } else {
        float cs = 0.08;
        vec2 g = vec2(x, y) / cs;
        vec2 gi = floor(g);
        float hs = h21(gi + 41.7);
        vec2 cp = gi + 0.15 + 0.7 * vec2(h21(gi + 1.3), h21(gi + 6.1));
        vec2 cw = cp * cs;
        if (hs < uSpecks * 0.023 && abs(cw.x) > 0.16 && cw.y > yH + 0.06) {
            float dpx = length(g - cp) * cs * pxH;
            float sz = 0.8 * uPx;
            float tw = 0.5 + 0.5 * sin(TAU * 2.0 * t / 6.0 + hs * 53.0);
            E += uKSpeck * exp(-sq(dpx / sz)) * (0.6 + 0.8 * h21(gi + 9.9)) * (0.4 + 0.6 * tw);
        }
    }

    vec3 col = uBg + (vec3(1.0) - uBg) * (vec3(1.0) - exp(-E));
    outColor = vec4(finish(col), 1.0);
}`
