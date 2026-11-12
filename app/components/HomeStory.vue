<script setup lang="ts">
import type { StageShots } from "~/components/StoryStage.vue";

// The home page's story: five chapters (StoryChapter, in the default slot) over one stage
// (StoryStage). This file owns how they are laid out together and how they move.
//
// Two ways to show it, from one set of elements:
// - As a page (phones, tablets, short windows, reduced motion, and until GSAP has loaded): the
//   chapters follow one another, each with its own real screens; the stage is the opening's picture.
//   Complete without any script.
// - As a cinematic stage (a desktop-sized window, motion allowed, GSAP loaded): the story is
//   --story-length windows tall and its viewport sticks to the window while you scroll through it.
//   Every chapter's text shares one frame, and one scrubbed timeline hands the stage and the text
//   from chapter to chapter. CSS position: sticky holds it (no pin, so nothing is moved in the DOM
//   and nothing jumps on the way in or out).
// The opening is laid out identically both ways, so switching to the stage after load moves nothing.
defineProps<{
  shots: StageShots;
}>();

// ---------------------------------------------------------------------------
// Story structure
// ---------------------------------------------------------------------------

// The chapters in reading order, as StoryChapter's data-chapter names them.
const chapterNames = [
  "intro",
  "nuqta",
  "insights",
  "dalaly",
  "custom",
] as const;
type ChapterName = (typeof chapterNames)[number];

const isChapterName = (value: string | undefined): value is ChapterName =>
  chapterNames.some((name) => name === value);

// ---------------------------------------------------------------------------
// Responsive and accessibility rules
// ---------------------------------------------------------------------------

// The window size that holds the cover. Keep in step with $cover in the styles below and in
// StoryStage.vue and StoryChapter.vue.
const coverQuery = "(min-width: 64em) and (min-height: 36em)";
// All motion, scroll and entrance alike, is for visitors who have not asked for less.
const motionQuery = "(prefers-reduced-motion: no-preference)";

// ---------------------------------------------------------------------------
// Motion timeline configuration (in window heights of scroll)
// ---------------------------------------------------------------------------

interface Beat {
  // Where the chapter is fully on show, and for how long it stays so before the next hand-over.
  rest: number;
  hold: number;
}

const beats: {
  length: number;
  scrub: number;
  chapters: Record<ChapterName, Beat>;
} = {
  // The scroll the stage holds for. Keep --story-length (below) at length + 1. It assumes the five
  // services in company.ts: chapter 05's tour (below) ends here.
  length: 9.35,
  // Seconds the stage takes to catch up with the scroll: smooth, never sluggish.
  scrub: 0.5,
  // Each hand-over runs from one chapter's rest plus hold to the next one's rest: one window
  // height each. The opening starts handing over at once, as a page's first screen would scroll.
  // Chapter 05's own text stays for the whole tour of its services.
  chapters: {
    intro: { rest: 0, hold: 0 },
    nuqta: { rest: 1, hold: 0.5 },
    insights: { rest: 2.5, hold: 0.5 },
    dalaly: { rest: 4, hold: 0.5 },
    custom: { rest: 5.5, hold: 3.85 },
  },
};

// Chapter 05's tour: its services one at a time (data-scene, in reading order), then the overview
// of them all with the call. Service k (from 0) rests at first + k * step and holds for
// step - handOver; the overview rests a step after the last one and holds for overviewHold. Each
// scene's hand-over is handOver long. With five services: 5.75, 6.35, 6.95, 7.55, 8.15, then the
// overview at 8.75 until 9.35.
const tour: {
  first: number;
  step: number;
  handOver: number;
  overviewHold: number;
} = {
  first: 5.75,
  step: 0.6,
  handOver: 0.25,
  overviewHold: 0.6,
};

// The three phases of every hand-over, as shares of it. Preparation clears what is leaving (the
// text first), transformation moves the stage into its next state, resolution brings the next
// chapter's text in and settles the camera. They overlap a little, so the stage is never empty and
// only one thing leads at a time.
const phases = {
  prepare: [0, 0.4],
  transform: [0.2, 0.8],
  resolve: [0.6, 1],
} as const;

// Where the camera looks inside a screen and how close it goes: the point of sale's product cards
// cards (daily work), then the home screen's row of today's figures. Anchored on the menu side, so the
// program's own menu stays in view.
const focus = {
  operations: { origin: "100% 62%", scale: 1.14 },
  insights: { origin: "100% 10%", scale: 1.16 },
  // Dalaly's list of offers, from the top of the menu side: the active "عروض البيع" item and the
  // first rows of offers (what its tagline is about).
  listing: { origin: "100% 18%", scale: 1.1 },
};

// How far a headline's word or line travels through its mask (a share of its own height): far
// enough that no dot or tail of a letter is left showing at the mask's edge.
const maskTravel = 150;

// What moves with a part of the story: the elements `selector` finds in `scope`, the scope too if
// it matches. A chapter leaves out its scenes (chapter 05's services and its call, which come and
// go on their own beats), and nothing ever takes what is in the rail, which only shows progress.
function own(selector: string, scope: HTMLElement): HTMLElement[] {
  const inScene = scope.closest("[data-scene]") !== null;
  return [
    ...(scope.matches(selector) ? [scope] : []),
    ...Array.from(scope.querySelectorAll<HTMLElement>(selector)),
  ].filter(
    (element) =>
      !element.closest("[data-rail]") &&
      (inScene || !element.closest("[data-scene]")),
  );
}

// A leaning edge crossing a box from its reading start (the right edge; the site is right to left
// only) to its end, as a clip-path: share 0 shows none of the box, 1 all of it. `slant` is the
// brand lean in radians; the box is measured each time, so call it on every refresh.
function leaningEdge(box: HTMLElement, slant: number, share: number) {
  const lean =
    (Math.tan(slant) * box.offsetHeight * 100) / Math.max(box.offsetWidth, 1);
  const top = (100 + lean) * (1 - share);
  return `polygon(${top}% 0%, 100% 0%, 100% 100%, ${top - lean}% 100%)`;
}

// ---------------------------------------------------------------------------
// Set-up and clean-up
// ---------------------------------------------------------------------------

type Gsap = typeof import("gsap").gsap;
type ScrollTriggerApi = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type TweenTarget = HTMLElement | HTMLElement[];

const root = ref<HTMLElement | null>(null);
let stopMotion: (() => void) | undefined;
let unmounted = false;

onMounted(startMotion);

onBeforeUnmount(() => {
  unmounted = true;
  stopMotion?.();
});

// GSAP is fetched while the page hydrates and set up after mount, so the server render and
// hydration never see it. If it fails to load, the story simply stays a page.
const loadMotion = () =>
  Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
const motionModules = import.meta.client ? loadMotion() : undefined;
motionModules?.catch(() => undefined);

async function startMotion() {
  let modules: Awaited<ReturnType<typeof loadMotion>>;
  try {
    modules = await (motionModules ?? loadMotion());
    await document.fonts.ready;
  } catch {
    return;
  }
  const [{ gsap }, { ScrollTrigger }] = modules;
  const story = root.value;
  if (unmounted || !story) return;
  gsap.registerPlugin(ScrollTrigger);

  // Runs again whenever a condition changes (a window resized past the cover, reduced motion
  // switched on), after reverting everything the last run made.
  const media = gsap.matchMedia();
  media.add(
    { cinematic: `${motionQuery} and ${coverQuery}`, motion: motionQuery },
    (context) => {
      const conditions = context.conditions ?? {};
      if (conditions.cinematic)
        return playCinematic(story, gsap, ScrollTrigger);
      if (conditions.motion) return playPage(story, gsap, ScrollTrigger);
      return undefined;
    },
  );

  // Images and fonts settle the layout: measure again once the page has loaded.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });

  stopMotion = () => {
    window.removeEventListener("load", refresh);
    media.revert();
  };
}

// ---------------------------------------------------------------------------
// The cinematic stage
// ---------------------------------------------------------------------------

function playCinematic(
  story: HTMLElement,
  gsap: Gsap,
  ScrollTrigger: ScrollTriggerApi,
) {
  // The stage takes over first, so everything below is measured in its layout. The opening looks the
  // same either way, and the rest is set to its starting state before the next paint.
  story.classList.add("story--cinematic");

  const one = (selector: string, scope: ParentNode = story) =>
    scope.querySelector<HTMLElement>(selector);
  const all = (selector: string, scope: Element = story) =>
    gsap.utils.toArray<HTMLElement>(selector, scope);
  const some = (...items: (HTMLElement | null | undefined)[]) =>
    items.filter((item): item is HTMLElement => item instanceof HTMLElement);

  const chapters = Object.fromEntries(
    chapterNames.map((name) => [name, one(`[data-chapter="${name}"]`)]),
  ) as Record<ChapterName, HTMLElement | null>;

  const part = (name: string) => one(`[data-stage="${name}"]`);
  const [cameraNuqta, cameraDalaly] = all('[data-stage="camera"]');
  const slab = part("slab");
  const light = part("light");
  const operations = part("operations");
  const insights = part("insights");
  const report = part("report");
  const dalalyWorld = part("dalaly");
  const listing = part("listing");
  const detail = part("detail");
  const limeScreen = part("lime-screen");
  const lime = part("lime");
  const mark = part("mark");
  const operationsImage = operations?.querySelector("img") ?? null;
  const insightsImage = insights?.querySelector("img") ?? null;
  const listingImage = listing?.querySelector("img") ?? null;
  const rail = one("[data-rail]");
  const fills = all("[data-rail-fill]");

  // Chapter 05's scenes in reading order, each with its beat (see tour). The overview has two
  // parts: the names, and the ways to reach us under them.
  interface Scene extends Beat {
    name: string;
    parts: HTMLElement[];
  }
  const groups = new Map<string, HTMLElement[]>();
  for (const element of all("[data-scene]")) {
    const name = element.dataset.scene ?? "";
    groups.set(name, [...(groups.get(name) ?? []), element]);
  }
  const serviceCount = [...groups.keys()].filter(
    (name) => name !== "overview",
  ).length;
  let serviceIndex = 0;
  const scenes: Scene[] = [...groups].map(([name, parts]) =>
    name === "overview"
      ? {
          name,
          parts,
          rest: tour.first + serviceCount * tour.step,
          hold: tour.overviewHold,
        }
      : {
          name,
          parts,
          rest: tour.first + serviceIndex++ * tour.step,
          hold: tour.step - tour.handOver,
        },
  );
  const services = scenes.filter((scene) => scene.name !== "overview");
  const overview = scenes.find((scene) => scene.name === "overview");

  // The brand lean, read from the stylesheet so every wipe leans with the buttons and the slab.
  const slant =
    ((parseFloat(getComputedStyle(story).getPropertyValue("--slant-angle")) ||
      10) *
      Math.PI) /
    180;
  const cssNumber = (element: Element | null | undefined, name: string) =>
    element
      ? parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0
      : 0;

  // The chapter on show, and in chapter 05 the scene on show (see setActive, after the timeline).
  // Declared first: the trigger can report progress as soon as it exists.
  let active: HTMLElement | null = null;
  let activeScene: Scene | undefined;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: story,
      start: "top top",
      end: "bottom bottom",
      scrub: beats.scrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => setActive(self.progress * beats.length),
    },
  });

  // A tween only for the parts this page actually has. With `spread`, one tween per element, each a
  // share of `spread` later than the one before, in reading order. (A staggered fromTo in a scrubbed
  // timeline sets only its first element to the starting state; separate tweens set every one.)
  const play = (
    targets: TweenTarget | null | undefined,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    at: number,
    spread = 0,
  ) => {
    const list = Array.isArray(targets) ? some(...targets) : some(targets);
    if (!list.length) return;
    if (!spread || list.length === 1) {
      tl.fromTo(list, from, to, at);
      return;
    }
    const step = spread / (list.length - 1);
    list.forEach((item, index) =>
      tl.fromTo(item, { ...from }, { ...to }, at + index * step),
    );
  };

  // A hand-over's three phases on the timeline: between two chapters, or (`between`) any two
  // moments, such as two of chapter 05's scenes.
  interface Span {
    at: number;
    span: number;
  }
  const between = (start: number, end: number) => {
    const length = end - start;
    const phase = ([a, b]: readonly [number, number]): Span => ({
      at: start + a * length,
      span: (b - a) * length,
    });
    return {
      prepare: phase(phases.prepare),
      transform: phase(phases.transform),
      resolve: phase(phases.resolve),
    };
  };
  const handOver = (from: ChapterName, to: ChapterName) =>
    between(
      beats.chapters[from].rest + beats.chapters[from].hold,
      beats.chapters[to].rest,
    );

  // The text the stage shows (data-page-only text is shown only as a page; on the stage only screen
  // readers get it).
  const staged = "[data-reveal]:not([data-page-only])";

  // A chapter's (or a scene's) text leaves upward: its headline's words (or lines) slip out through
  // the top of their masks, everything else (a scene's number too) lifts and fades, in reading order.
  // The words fade as they go, so the dots under a letter (they hang lowest, and leave last) never
  // linger alone at the mask's edge.
  const leave = (scope: HTMLElement | null | undefined, { at, span }: Span) => {
    if (!scope) return;
    play(
      own("[data-mask-inner]", scope),
      { yPercent: 0, opacity: 1 },
      {
        yPercent: -maskTravel,
        opacity: 0,
        duration: span * 0.7,
        ease: "power2.in",
        immediateRender: false,
      },
      at,
      span * 0.3,
    );
    play(
      own(`${staged}, [data-sweep]`, scope),
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -24,
        duration: span * 0.6,
        ease: "power1.in",
        immediateRender: false,
      },
      at,
      span * 0.3,
    );
  };

  // A chapter's (or a scene's) text arrives the same way from below: the headline rises into its
  // masks word by word, then the rest follows. Set to its starting state now (immediateRender), so it
  // waits hidden.
  const arrive = (scope: HTMLElement | null | undefined, { at, span }: Span) => {
    if (!scope) return;
    play(
      own("[data-mask-inner]", scope),
      { yPercent: maskTravel, opacity: 1 },
      { yPercent: 0, opacity: 1, duration: span * 0.7, ease: "power3.out" },
      at,
      span * 0.3,
    );
    play(
      own(staged, scope),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: span * 0.6, ease: "power2.out" },
      at + span * 0.12,
      span * 0.28,
    );
  };

  // The leaning edge (leaningEdge), at this stage's lean. Measured on every refresh.
  const sweep = (box: HTMLElement, share: number) =>
    leaningEdge(box, slant, share);

  // The opening's pose, read from StoryStage's stylesheet (on every refresh) so the timeline starts
  // from exactly the pose the page shows: tilted back and set down, so only its top shows under the
  // offer. Every part of the transform is stated, so nothing GSAP reads from the stylesheet's matrix
  // is ever added on top of it.
  const viewport = one(".story__viewport");
  const tilt = (name: string) => () => cssNumber(cameraNuqta, name);
  const flat = {
    x: 0,
    y: 0,
    z: 0,
    xPercent: 0,
    yPercent: 0,
    rotation: 0,
    rotationY: 0,
    skewX: 0,
    skewY: 0,
  };
  // Down from its place to where only --peek of the window's height shows (StoryStage's --tilt-drop).
  // The window's place is its world's top padding (--win-top), read unrounded.
  const drop = () => {
    const world = cameraNuqta?.parentElement;
    if (!cameraNuqta || !world || !viewport) return 0;
    const top = parseFloat(getComputedStyle(world).paddingTop) || 0;
    return (
      viewport.clientHeight * (1 - cssNumber(cameraNuqta, "--peek") / 100) - top
    );
  };
  const tilted: gsap.TweenVars = {
    ...flat,
    transformPerspective: tilt("--tilt-depth"),
    y: drop,
    rotationX: tilt("--tilt-x"),
    scale: tilt("--tilt-scale"),
  };

  // The window's box on the stage (at rest, the camera holds no transform), for the lime to start
  // from: it fills the window first, then the stage.
  const windowBox = () => {
    const camera = cameraDalaly ?? cameraNuqta;
    const frame = listing ?? operations;
    if (!camera || !lime) return "inset(0px 0px 0px 0px round 0px)";
    const radius = frame
      ? parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0
      : 0;
    const top = camera.offsetTop;
    const left = camera.offsetLeft;
    const right = lime.offsetWidth - left - camera.offsetWidth;
    const bottom = lime.offsetHeight - top - camera.offsetHeight;
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
  };

  if (operationsImage)
    gsap.set(operationsImage, { transformOrigin: focus.operations.origin });
  if (insightsImage)
    gsap.set(insightsImage, { transformOrigin: focus.insights.origin });
  if (listingImage)
    gsap.set(listingImage, { transformOrigin: focus.listing.origin });

  // 01 → 02. The lime slab steps aside along its lean while the window rises and turns to face you:
  // Codel hands the stage to Nuqta Plus's point of sale. The camera then leans in on the
  // product cards and the cart, the work of the day.
  {
    const { prepare, transform, resolve } = handOver("intro", "nuqta");
    leave(chapters.intro, prepare);
    play(
      cameraNuqta,
      { ...tilted },
      {
        ...flat,
        transformPerspective: tilt("--tilt-depth"),
        rotationX: 0,
        scale: 1,
        duration: transform.span,
        ease: "power2.inOut",
      },
      transform.at,
    );
    play(
      slab,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 100% 0% 0%)",
        duration: transform.span * 0.8,
        ease: "power2.inOut",
      },
      transform.at,
    );
    play(
      light,
      { opacity: 0 },
      { opacity: 1, duration: transform.span * 0.6 },
      transform.at + transform.span * 0.4,
    );
    // One light at a time: the opening's glow (the page's light and its shade) fades out as Nuqta
    // Plus's own light comes up, then leaves the layout, so its canvas stops drawing (its observers
    // see no box and the render loop sleeps; scrolling back reverts the set and wakes it).
    const glow = all('[data-stage="glow"]');
    if (glow.length) {
      const gone = transform.at + transform.span * 0.5;
      play(
        glow,
        { opacity: 1 },
        { opacity: 0, duration: gone - prepare.at, ease: "power1.inOut" },
        prepare.at,
      );
      tl.set(glow, { display: "none" }, gone);
    }
    play(
      operationsImage,
      { scale: 1 },
      {
        scale: focus.operations.scale,
        duration: resolve.span,
        ease: "power1.inOut",
      },
      resolve.at,
    );
    arrive(chapters.nuqta, resolve);
  }

  // 02 → 03. Same program, next screen: the camera pulls back, and the home screen is swept in
  // over the point of sale inside the same menus, from the side the menu is on. The day's sales
  // become the day's figures; the camera settles on them and the sales report rises beside them.
  {
    const { prepare, transform, resolve } = handOver("nuqta", "insights");
    leave(chapters.nuqta, prepare);
    // Back to the whole screen before the sweep starts, so the two screens' menus line up exactly.
    play(
      operationsImage,
      { scale: focus.operations.scale },
      {
        scale: 1,
        duration: transform.at - prepare.at,
        ease: "power1.inOut",
        immediateRender: false,
      },
      prepare.at,
    );
    if (insights) {
      play(
        insights,
        { clipPath: () => sweep(insights, 0) },
        {
          clipPath: () => sweep(insights, 1),
          duration: transform.span,
          ease: "power2.inOut",
        },
        transform.at,
      );
    }
    play(
      insightsImage,
      { scale: 1 },
      {
        scale: focus.insights.scale,
        duration: resolve.span * 0.8,
        ease: "power1.inOut",
      },
      resolve.at,
    );
    arrive(chapters.insights, resolve);
    play(
      report,
      { opacity: 0, yPercent: 26 },
      {
        opacity: 1,
        yPercent: 0,
        duration: resolve.span * 0.6,
        ease: "power2.out",
      },
      resolve.at + resolve.span * 0.4,
    );
  }

  // 03 → 04. Another business: the report drops away and the camera eases back, then Dalaly's
  // sand world is swept across the whole stage along the brand's lean, its window in exactly the
  // same place, so the one window changes program as the edge passes over it. The camera then leans
  // in on its list of offers, as it did on the point of sale.
  {
    const { prepare, transform, resolve } = handOver("insights", "dalaly");
    const cameras = some(cameraNuqta, cameraDalaly);
    leave(chapters.insights, prepare);
    play(
      report,
      { opacity: 1, yPercent: 0 },
      {
        opacity: 0,
        yPercent: 26,
        duration: prepare.span * 0.6,
        ease: "power2.in",
        immediateRender: false,
      },
      prepare.at,
    );
    play(
      insightsImage,
      { scale: focus.insights.scale },
      {
        scale: 1,
        duration: prepare.span,
        ease: "power1.inOut",
        immediateRender: false,
      },
      prepare.at,
    );
    play(
      cameras,
      { scale: 1 },
      {
        scale: 0.92,
        duration: transform.at + transform.span / 2 - prepare.at,
        ease: "power2.inOut",
        immediateRender: false,
      },
      prepare.at,
    );
    if (dalalyWorld) {
      play(
        dalalyWorld,
        { clipPath: () => sweep(dalalyWorld, 0) },
        {
          clipPath: () => sweep(dalalyWorld, 1),
          duration: transform.span,
          ease: "power2.inOut",
        },
        transform.at,
      );
    }
    play(
      listingImage,
      { scale: 1 },
      {
        scale: focus.listing.scale,
        duration: resolve.span,
        ease: "power1.inOut",
      },
      resolve.at,
    );
    play(
      light,
      { opacity: 1 },
      { opacity: 0, duration: transform.span / 2, immediateRender: false },
      transform.at,
    );
    play(
      cameras,
      { scale: 0.92 },
      {
        scale: 1,
        duration:
          resolve.at + resolve.span - (transform.at + transform.span / 2),
        ease: "power2.inOut",
        immediateRender: false,
      },
      transform.at + transform.span / 2,
    );
    arrive(chapters.dalaly, resolve);
    play(
      detail,
      { opacity: 0, yPercent: 26 },
      {
        opacity: 1,
        yPercent: 0,
        duration: resolve.span * 0.6,
        ease: "power2.out",
      },
      resolve.at + resolve.span * 0.4,
    );
  }

  // 04 → 05. Back to Codel: lime sweeps across the window's screen along the same lean, the Codel
  // symbol appears on it, then the stage's lime takes over from exactly that box and grows out of
  // the window until it is the whole stage. The closing call is written on it.
  {
    const { prepare, transform, resolve } = handOver("dalaly", "custom");
    leave(chapters.dalaly, prepare);
    play(
      detail,
      { opacity: 1, yPercent: 0 },
      {
        opacity: 0,
        yPercent: 26,
        duration: prepare.span * 0.6,
        ease: "power2.in",
        immediateRender: false,
      },
      prepare.at,
    );
    // Back to the whole screen before the lime sweeps over the window.
    play(
      listingImage,
      { scale: focus.listing.scale },
      {
        scale: 1,
        duration: transform.at - prepare.at,
        ease: "power1.inOut",
        immediateRender: false,
      },
      prepare.at,
    );
    // The window's screen fills with lime first; the symbol appears only once it is all lime.
    const fill = transform.span * 0.4;
    const grow = fill + transform.span * 0.1;
    if (limeScreen) {
      play(
        limeScreen,
        { clipPath: () => sweep(limeScreen, 0) },
        {
          clipPath: () => sweep(limeScreen, 1),
          duration: fill,
          ease: "power2.inOut",
        },
        transform.at,
      );
    }
    // The hand-over between the two limes is invisible: same colour, same box.
    play(
      lime,
      { opacity: 0, clipPath: windowBox },
      { opacity: 1, duration: 0.001 },
      transform.at + fill,
    );
    play(
      mark,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1,
        scale: 1,
        duration: transform.span * 0.2,
        ease: "power2.out",
      },
      transform.at + fill,
    );
    play(
      lime,
      { clipPath: windowBox },
      {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
        duration: transform.span - grow,
        ease: "power3.inOut",
        immediateRender: false,
      },
      transform.at + grow,
    );
    play(
      mark,
      { opacity: 1, scale: 1 },
      {
        opacity: 0,
        scale: 1.12,
        duration: transform.span * 0.25,
        ease: "power1.in",
        immediateRender: false,
      },
      transform.at + fill + transform.span * 0.25,
    );
    arrive(chapters.custom, resolve);
    // The tour's rail comes in with the heading, its bars empty (each fills with its service).
    play(
      rail,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: resolve.span * 0.6, ease: "power2.out" },
      resolve.at + resolve.span * 0.12,
    );
  }

  // 05, the tour. One service at a time where the window was: its number swept in along the lean,
  // then its name risen through its mask, then what it is and how to ask, while its bar on the rail
  // fills; the one before it leaves as the chapters' texts do. After the last one the rail gives way
  // to the ways to reach us, and every service is named at once.
  {
    // A bar fills from the reading start (the right edge). Each waits empty: its fill below sets its
    // starting state when the timeline is built (immediateRender).
    const empty = "inset(0% 0% 0% 100%)";
    services.forEach((scene, index) => {
      const before = services[index - 1];
      const start = before
        ? before.rest + before.hold
        : scene.rest - tour.handOver;
      const { prepare, resolve } = between(start, scene.rest);
      before?.parts.forEach((element) => leave(element, prepare));
      for (const element of scene.parts) {
        const numeral = element.querySelector<HTMLElement>("[data-sweep]");
        if (numeral) {
          play(
            numeral,
            { clipPath: () => sweep(numeral, 0) },
            {
              clipPath: () => sweep(numeral, 1),
              duration: resolve.span * 0.6,
              ease: "power2.inOut",
            },
            resolve.at,
          );
        }
        arrive(element, {
          at: resolve.at + resolve.span * 0.15,
          span: resolve.span * 0.85,
        });
      }
      play(
        fills[index],
        { clipPath: empty },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: scene.rest - start,
          ease: "power1.inOut",
        },
        start,
      );
    });

    const last = services.at(-1);
    if (overview && last) {
      const { prepare, resolve } = between(last.rest + last.hold, overview.rest);
      last.parts.forEach((element) => leave(element, prepare));
      play(
        rail,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -16,
          duration: prepare.span,
          ease: "power1.in",
          immediateRender: false,
        },
        prepare.at,
      );
      // The names first, in reading order; the ways to reach us (its later part) a little after.
      overview.parts.forEach((element, index) =>
        arrive(
          element,
          index === 0
            ? resolve
            : {
                at: resolve.at + resolve.span * 0.2,
                span: resolve.span * 0.8,
              },
        ),
      );
    }
  }

  // The timeline spans the whole scroll, whatever its last tween is.
  tl.set({}, {}, beats.length);

  // How far a moment of the scroll is from a beat: 0 while it is on show.
  function distance({ rest, hold }: Beat, time: number) {
    return time < rest ? rest - time : Math.max(0, time - rest - hold);
  }

  // Only the chapter on show takes pointer input: the stacked texts would otherwise catch each
  // other's clicks. In chapter 05 so does only the scene on show (every part of it), by the same
  // rule. Both change halfway through each hand-over.
  function setActive(time: number) {
    let next: ChapterName = "intro";
    let nearest = Infinity;
    for (const name of chapterNames) {
      const away = distance(beats.chapters[name], time);
      if (away < nearest) {
        nearest = away;
        next = name;
      }
    }
    const element = chapters[next];
    if (element !== active) {
      active?.removeAttribute("data-active");
      element?.setAttribute("data-active", "");
      active = element;
    }

    let scene: Scene | undefined;
    if (next === "custom") {
      nearest = Infinity;
      for (const item of scenes) {
        const away = distance(item, time);
        if (away < nearest) {
          nearest = away;
          scene = item;
        }
      }
    }
    if (scene === activeScene) return;
    activeScene?.parts.forEach((part) => part.removeAttribute("data-active"));
    scene?.parts.forEach((part) => part.setAttribute("data-active", ""));
    activeScene = scene;
  }
  setActive((tl.scrollTrigger?.progress ?? 0) * beats.length);

  // Keyboard focus can land in a chapter (or one of chapter 05's scenes) that is not on show (the
  // texts share one frame). The window then scrolls straight to that scene's or chapter's rest and
  // the stage catches up at once, so nothing is ever focused half-faded or behind another chapter.
  const onFocus = (event: FocusEvent) => {
    const target = event.target;
    const trigger = tl.scrollTrigger;
    if (
      !(target instanceof HTMLElement) ||
      !trigger ||
      !target.matches(":focus-visible")
    )
      return;
    const part = target.closest<HTMLElement>("[data-scene]");
    const scene = part
      ? scenes.find((item) => item.parts.includes(part))
      : undefined;
    const name = target.closest<HTMLElement>("[data-chapter]")?.dataset.chapter;
    const beat = scene ?? (isChapterName(name) ? beats.chapters[name] : null);
    if (!beat) return;
    const { rest, hold } = beat;
    const time = trigger.progress * beats.length;
    if (time < rest - 0.01 || time > rest + hold + 0.01) {
      const top =
        trigger.start + (rest / beats.length) * (trigger.end - trigger.start);
      window.scrollTo({ top, behavior: "instant" });
      ScrollTrigger.update();
    }
    trigger.getTween()?.progress(1);
  };
  story.addEventListener("focusin", onFocus);

  return () => {
    story.removeEventListener("focusin", onFocus);
    active?.removeAttribute("data-active");
    activeScene?.parts.forEach((element) =>
      element.removeAttribute("data-active"),
    );
    story.classList.remove("story--cinematic");
  };
}

// ---------------------------------------------------------------------------
// The page (motion allowed, no cinematic stage): each chapter shows itself once, as it arrives
// ---------------------------------------------------------------------------

function playPage(
  story: HTMLElement,
  gsap: Gsap,
  ScrollTrigger: ScrollTriggerApi,
) {
  const all = (selector: string, scope: Element = story) =>
    gsap.utils.toArray<HTMLElement>(selector, scope);
  const ease = "power2.out";

  // The brand lean, for the screens' and the numbers' wipe: the leaning edge (leaningEdge) across
  // the box, from none of it (`closed`) to all of it (`open`).
  const slant =
    ((parseFloat(getComputedStyle(story).getPropertyValue("--slant-angle")) ||
      10) *
      Math.PI) /
    180;
  const closed = (box: HTMLElement) => leaningEdge(box, slant, 0);
  const open = (box: HTMLElement) => leaningEdge(box, slant, 1);

  for (const chapter of all("[data-chapter]")) {
    // The opening has its own CSS entrance.
    if (chapter.dataset.chapter === "intro") continue;

    // Chapter 05's scenes are not the chapter's own: each shows itself (below).
    const masks = own("[data-mask-inner]", chapter);
    const items = own("[data-reveal]", chapter);
    const text = gsap.timeline({
      scrollTrigger: { trigger: chapter, start: "top 78%", once: true },
    });
    if (masks.length) {
      text.from(
        masks,
        {
          yPercent: maskTravel,
          duration: 0.48,
          stagger: 0.06,
          ease: "power3.out",
        },
        0,
      );
    }
    if (items.length)
      text.from(
        items,
        { opacity: 0, y: 16, duration: 0.48, stagger: 0.06, ease },
        0.1,
      );

    // The main screen is wiped in from the reading start behind a leaning edge; the second one
    // then rises over its corner.
    const main = chapter.querySelector<HTMLElement>('[data-media="main"]');
    const second = chapter.querySelector<HTMLElement>('[data-media="second"]');
    if (!main) continue;
    const screens = gsap.timeline({
      scrollTrigger: { trigger: main, start: "top 85%", once: true },
    });
    screens.fromTo(
      main,
      { clipPath: () => closed(main), y: 32 },
      {
        clipPath: () => open(main),
        y: 0,
        duration: 0.8,
        ease: "expo.inOut",
        clearProps: "clipPath",
      },
    );
    if (second)
      screens.from(
        second,
        { opacity: 0, yPercent: 12, duration: 0.48, ease },
        "-=0.2",
      );
  }

  // Chapter 05's services (then the overview's link to the services page, and the ways to reach us)
  // are entries of their own, each shown once as it scrolls in: its number wiped in along the lean,
  // then its name risen through its mask, then what it is and how to ask. What only the stage shows
  // (data-stage-only: the overview's names) is left out.
  for (const scene of all("[data-scene]:not([data-stage-only])")) {
    const numeral = scene.querySelector<HTMLElement>("[data-sweep]");
    const masks = own("[data-mask-inner]", scene);
    const items = own("[data-reveal]", scene).filter(
      (element) => !element.closest("[data-stage-only]"),
    );
    const entry = gsap.timeline({
      scrollTrigger: { trigger: scene, start: "top 85%", once: true },
    });
    let at = 0;
    if (numeral) {
      entry.fromTo(
        numeral,
        { clipPath: () => closed(numeral) },
        {
          clipPath: () => open(numeral),
          duration: 0.6,
          ease: "expo.inOut",
          clearProps: "clipPath",
        },
        at,
      );
      at += 0.2;
    }
    if (masks.length) {
      entry.from(
        masks,
        { yPercent: maskTravel, duration: 0.48, ease: "power3.out" },
        at,
      );
    }
    if (items.length)
      entry.from(
        items,
        { opacity: 0, y: 16, duration: 0.48, stagger: 0.06, ease },
        at + 0.1,
      );
  }

  // Keyboard focus can reach an element before its reveal has run: whatever holds focus jumps to
  // its end state at once.
  const onFocus = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    for (const trigger of ScrollTrigger.getAll()) {
      const element = trigger.trigger;
      if (element && element.contains(target)) trigger.animation?.progress(1);
    }
  };
  story.addEventListener("focusin", onFocus);

  return () => story.removeEventListener("focusin", onFocus);
}
</script>

<template>
  <div ref="root" class="story">
    <div class="story__viewport">
      <StoryStage class="story__stage" :shots="shots" />
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
// The window size that holds the cover. Same as coverQuery in the script, and $cover in
// StoryStage.vue and StoryChapter.vue.
$cover: "(min-width: 64em) and (min-height: 36em)";
// A cover window short enough (laptops) that the opening's screen shows less of itself. Same as
// $cover-short in index.vue.
$cover-short: "(min-width: 64em) and (min-height: 36em) and (max-height: 46em)";

// The story's layout lengths, shared by the stage and the chapters (both read them).
// --edge runs from the window edge to the content column, the same column as the header bar's, and
// --content-w is that column (100cqi is the story's own width: the window without its scrollbar).
.story {
  // The timeline's length (beats.length in the script) + 1.
  --story-length: 10.35;
  --edge: max(
    var(--page-gutter),
    calc((100cqi - var(--container-max)) / 2 + var(--page-gutter))
  );
  --content-w: calc(100cqi - 2 * var(--edge));
  --copy-gap: clamp(var(--space-7), 5cqi, var(--space-9));

  container: story / inline-size;

  // The cover: the story slides up behind the header and its first screen fills the window. Every
  // chapter keeps one frame: its heading in a band of fixed height under the header (--head-h, the
  // heading sits on the band's bottom line), then the window, centred, starting at the same line
  // in every chapter (--win-top). The window is as wide as the room under that line allows, never
  // narrower than 56rem nor wider than the column; on a short window it runs off the bottom edge.
  // In the opening it shows only its top (--peek, in window heights), tilted back under the offer.
  @media #{$cover} {
    --header-room: calc(var(--header-height) + var(--space-3));
    --cover-pad: clamp(var(--space-4), 3svh, var(--space-6));
    --room-top: calc(var(--header-room) + var(--cover-pad));
    --head-h: clamp(9rem, 22svh, 13rem);
    --head-gap: clamp(var(--space-5), 3.5svh, var(--space-7));
    --win-top: calc(var(--room-top) + var(--head-h) + var(--head-gap));
    --win-w: min(
      var(--content-w),
      max(56rem, (100svh - var(--win-top) - var(--cover-pad)) * 16 / 9)
    );
    --peek: 19;

    margin-block-start: calc(-1 * var(--header-room));
  }

  // A short cover: less of the opening's screen, so the offer keeps its room above the plinth.
  @media #{$cover-short} {
    --peek: 15;
  }
}

.story__viewport {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

// As a page: the opening's text, then its picture (the stage), then the other chapters in order.
// In the cover the picture sits behind the text instead, filling the window with it.
.story:not(.story--cinematic) {
  .story__stage {
    grid-row: 2;
    grid-column: 1;
  }

  .story__viewport > :deep(.chapter--intro) {
    grid-row: 1;
    grid-column: 1;
  }

  @media #{$cover} {
    .story__stage {
      grid-row: 1;
    }
  }

  // The mirror of data-page-only: what only the stage needs, a recap the page does without (its
  // entries already are the overview) and the tour's rail. Without JavaScript the story is never
  // cinematic, so these stay hidden.
  :deep([data-stage-only]) {
    display: none;
  }
}

// The cinematic stage: as tall as the story's scroll, its viewport held to the window throughout.
.story--cinematic {
  block-size: calc(var(--story-length) * 100svh);

  // Detail the stage leaves to the page and the product pages (a product's description and
  // features): still read by screen readers, not shown.
  :deep([data-page-only]) {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  // Chapter 05's scenes share one cell: only the one on show takes pointer input (data-active, set
  // by the timeline).
  :deep([data-scene]:not([data-active])) {
    pointer-events: none;
  }

  // Clipped, not hidden: `clip` makes no scroll container, so focusing a link near the bottom edge
  // can never scroll the stage out of place.
  .story__viewport {
    position: sticky;
    inset-block-start: 0;
    block-size: 100svh;
    overflow: clip;
  }

  .story__stage {
    grid-area: 1 / 1;
  }
}
</style>
