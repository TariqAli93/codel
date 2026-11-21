// The shaders of the floor's mesh (IsoFloor.vue): one triangle over the whole canvas, and a fragment
// shader that draws the ground under each pixel. The ground is an isometric grid on the plates' own
// axes (a cell's edge runs 30 degrees off the horizontal). At rest it is flat, and the same picture
// as the static grid it is drawn over; while it is astir it is lifted a little here and there (a
// very low swell, a mound where the lime patch is, a few crossings glowing), and a shallow mound
// rises under the pointer.

// How the floor looks at rest. The static grid in IsoFloor.vue is drawn from the same numbers, so
// the two agree and the mesh can take over from the grid unseen:
// - the alpha of a line off the patch and at the patch's centre, and of a crossing's dot there;
// - the haze at the patch's centre;
// - how far the patch's lime and its haze reach: the sigma of each bell, in cells.
export const look = {
  line: 0.26,
  lineLit: 0.55,
  node: 0.8,
  haze: 0.095,
  litSigma: 1.8,
  hazeSigma: 1.7,
} as const;

// A number as GLSL wants it: always with a decimal point.
const float = (value: number) => value.toFixed(3);

export const VERT = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;      // the drawing buffer, px
uniform float uStack;   // the stack's width, buffer px: every height is a share of it
uniform float uCell;    // a cell's edge on the ground, buffer px
uniform vec2 uOrigin;   // where the ground's origin is drawn, buffer px from the top left
uniform float uPx;      // buffer px to a CSS px
uniform float uTime;    // the swell's own clock, s
uniform float uSwell;   // how far the floor is astir, 0 (at rest, flat) to 1
uniform vec3 uPointer;  // the pointer on the ground (cells), and how far its mound is up (0..1)
uniform vec2 uPatch;    // the lime patch's centre on the ground (cells)
uniform float uReveal;  // the mesh's own alpha, 0..1
uniform vec3 uLine;     // the grid's colour
uniform vec3 uAccent;   // lime

const float C30 = 0.8660254;
const float S30 = 0.5;

// Screen (px from the origin, y down) to ground (cells), for a point lying on the flat ground.
vec2 toGround(vec2 s) {
  float a = s.y / (uCell * S30);
  float b = s.x / (uCell * C30);
  return 0.5 * vec2(a + b, a - b);
}

float bell(vec2 d, float sigma) {
  return exp(-dot(d, d) / (2.0 * sigma * sigma));
}

// How high the surface stands over a ground point, px (up). Nothing at rest; astir, a very low
// swell and a mound at the patch; and the pointer's mound whenever it is up.
float height(vec2 g) {
  float swell = sin(g.x * 0.55 + uTime * 0.50) * cos(g.y * 0.45 - uTime * 0.38)
              + 0.6 * sin((g.x + g.y) * 0.33 + uTime * 0.27);
  float h = 0.012 * uStack * swell + 0.03 * uStack * bell(g - uPatch, 2.0);
  h *= uSwell;
  h += 0.06 * uStack * uPointer.z * bell(g - uPointer.xy, 1.8);
  return h;
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) - uOrigin;
  // The ground point seen at this pixel: a point lifted by h is drawn h px higher, so step back
  // down by the height found so far. Three rounds settle a surface this shallow.
  vec2 g = toGround(s);
  for (int i = 0; i < 3; i++) g = toGround(s + vec2(0.0, height(g)));

  vec2 f = fract(g);
  vec2 d = min(f, 1.0 - f);                 // cells to the nearest line, each way
  // Cells to a px, across each family of lines: the true slope, so a line is one px wide whichever
  // way it runs (fwidth would overstate it on these diagonals and fatten them).
  vec2 w = max(
    vec2(length(vec2(dFdx(g.x), dFdy(g.x))), length(vec2(dFdx(g.y), dFdy(g.y)))),
    vec2(1e-5));
  vec2 px = d / w;                          // px to the nearest line, each way
  float halfLine = 0.5 * uPx;               // a line one CSS px wide
  vec2 cover = 1.0 - smoothstep(halfLine - 0.6, halfLine + 0.6, px);
  float line = max(cover.x, cover.y);

  // Where the lime is: on the patch, and under the pointer while its mound is up.
  float lit = clamp(
    bell(g - uPatch, ${float(look.litSigma)}) + uPointer.z * bell(g - uPointer.xy, 2.0),
    0.0, 1.0);

  // Crossings: lit where the lime is, and, astir, a few chosen ones glowing slowly on their own.
  float r = 1.7 * uPx;
  float node = 1.0 - smoothstep(r - 0.8, r + 0.8, length(px));
  vec2 id = floor(g + 0.5);
  float chosen = step(0.9, hash(id));
  float glow = chosen * uSwell * (0.35 + 0.3 * sin(uTime * 0.9 + hash(id + 7.0) * 6.2832));

  vec3 lineColor = mix(uLine, uAccent, lit);
  float lineAlpha = line * mix(${float(look.line)}, ${float(look.lineLit)}, lit);
  float nodeAlpha = node * max(lit * ${float(look.node)}, glow);
  float haze = ${float(look.haze)} * bell(g - uPatch, ${float(look.hazeSigma)})
             + 0.05 * uPointer.z * bell(g - uPointer.xy, 2.0);

  // Premultiplied: the lines, the crossings over them, the haze under both.
  vec3 rgb = lineColor * lineAlpha;
  float a = lineAlpha;
  rgb = rgb * (1.0 - nodeAlpha) + uAccent * nodeAlpha;
  a = a * (1.0 - nodeAlpha) + nodeAlpha;
  rgb += uAccent * haze * (1.0 - a);
  a += haze * (1.0 - a);
  outColor = vec4(rgb, a) * uReveal;
}`;

export const UNIFORMS = [
  "uRes",
  "uStack",
  "uCell",
  "uOrigin",
  "uPx",
  "uTime",
  "uSwell",
  "uPointer",
  "uPatch",
  "uReveal",
  "uLine",
  "uAccent",
] as const;

export type UniformName = (typeof UNIFORMS)[number];
