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
  // The scroll the stage holds for. Keep --story-length (below) at length + 1.
  length: 6,
  // Seconds the stage takes to catch up with the scroll: smooth, never sluggish.
  scrub: 0.5,
  // Each hand-over runs from one chapter's rest plus hold to the next one's rest: one window
  // height each. The opening starts handing over at once, as a page's first screen would scroll.
  chapters: {
    intro: { rest: 0, hold: 0 },
    nuqta: { rest: 1, hold: 0.5 },
    insights: { rest: 2.5, hold: 0.5 },
    dalaly: { rest: 4, hold: 0.5 },
    custom: { rest: 5.5, hold: 0.5 },
  },
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
};

// How far a headline's word or line travels through its mask (a share of its own height): far
// enough that no dot or tail of a letter is left showing at the mask's edge.
const maskTravel = 150;

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

  // The chapter on show (see setActive, after the timeline). Declared first: the trigger can report
  // progress as soon as it exists.
  let active: HTMLElement | null = null;

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

  // A hand-over's three phases on the timeline.
  interface Span {
    at: number;
    span: number;
  }
  const handOver = (from: ChapterName, to: ChapterName) => {
    const start = beats.chapters[from].rest + beats.chapters[from].hold;
    const length = beats.chapters[to].rest - start;
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

  // The text the stage shows (data-page-only text is shown only as a page; on the stage only screen
  // readers get it).
  const staged = "[data-reveal]:not([data-page-only])";

  // A chapter's text leaves upward: its headline's words (or lines) slip out through the top of their
  // masks, everything else lifts and fades, in reading order. The words fade as they go, so the dots
  // under a letter (they hang lowest, and leave last) never linger alone at the mask's edge.
  const leave = (chapter: HTMLElement | null, { at, span }: Span) => {
    if (!chapter) return;
    play(
      all("[data-mask-inner]", chapter),
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
      all(staged, chapter),
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

  // A chapter's text arrives the same way from below: the headline rises into its masks word by
  // word, then the rest follows. Set to its starting state now (immediateRender), so it waits hidden.
  const arrive = (chapter: HTMLElement | null, { at, span }: Span) => {
    if (!chapter) return;
    play(
      all("[data-mask-inner]", chapter),
      { yPercent: maskTravel, opacity: 1 },
      { yPercent: 0, opacity: 1, duration: span * 0.7, ease: "power3.out" },
      at,
      span * 0.3,
    );
    play(
      all(staged, chapter),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: span * 0.6, ease: "power2.out" },
      at + span * 0.12,
      span * 0.28,
    );
  };

  // A leaning edge crossing a box from its reading start (the right edge; the site is right to left
  // only) to its end: share 0 shows none of the box, 1 all of it. Measured on every refresh.
  const sweep = (box: HTMLElement, share: number) => {
    const lean =
      (Math.tan(slant) * box.offsetHeight * 100) / Math.max(box.offsetWidth, 1);
    const top = (100 + lean) * (1 - share);
    return `polygon(${top}% 0%, 100% 0%, 100% 100%, ${top - lean}% 100%)`;
  };

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
  // same place, so the one window changes program as the edge passes over it.
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
  }

  // The timeline spans the whole scroll, whatever its last tween is.
  tl.set({}, {}, beats.length);

  // Only the chapter on show takes pointer input: the stacked texts would otherwise catch each
  // other's clicks. It changes halfway through each hand-over.
  function setActive(time: number) {
    let next: ChapterName = "intro";
    let nearest = Infinity;
    for (const name of chapterNames) {
      const { rest, hold } = beats.chapters[name];
      const distance =
        time < rest ? rest - time : Math.max(0, time - rest - hold);
      if (distance < nearest) {
        nearest = distance;
        next = name;
      }
    }
    const element = chapters[next];
    if (element === active) return;
    active?.removeAttribute("data-active");
    element?.setAttribute("data-active", "");
    active = element;
  }
  setActive((tl.scrollTrigger?.progress ?? 0) * beats.length);

  // Keyboard focus can land in a chapter that is not on show (the texts share one frame). The
  // window then scrolls straight to that chapter's rest and the stage catches up at once, so
  // nothing is ever focused half-faded or behind another chapter.
  const onFocus = (event: FocusEvent) => {
    const target = event.target;
    const trigger = tl.scrollTrigger;
    if (
      !(target instanceof HTMLElement) ||
      !trigger ||
      !target.matches(":focus-visible")
    )
      return;
    const name = target.closest<HTMLElement>("[data-chapter]")?.dataset.chapter;
    if (!isChapterName(name)) return;
    const { rest, hold } = beats.chapters[name];
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

  // The brand lean, for the screens' wipe.
  const slant =
    ((parseFloat(getComputedStyle(story).getPropertyValue("--slant-angle")) ||
      10) *
      Math.PI) /
    180;

  for (const chapter of all("[data-chapter]")) {
    // The opening has its own CSS entrance.
    if (chapter.dataset.chapter === "intro") continue;

    const masks = all("[data-mask-inner]", chapter);
    const items = all("[data-reveal]", chapter);
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
    const lean = () =>
      (Math.tan(slant) * main.offsetHeight * 100) /
      Math.max(main.offsetWidth, 1);
    const screens = gsap.timeline({
      scrollTrigger: { trigger: main, start: "top 85%", once: true },
    });
    screens.fromTo(
      main,
      {
        clipPath: () =>
          `polygon(${100 + lean()}% 0%, ${100 + lean()}% 0%, ${100 + lean()}% 100%, 100% 100%)`,
        y: 32,
      },
      {
        clipPath: () =>
          `polygon(0% 0%, ${100 + lean()}% 0%, ${100 + lean()}% 100%, ${-lean()}% 100%)`,
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
  --story-length: 7;
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

  // Clipped, not hidden: `clip` makes no scroll container, so focusing a link near the bottom edge
  // can never scroll the stage out of place.
  .story__viewport {
    position: sticky;
    inset-block-start: var(--header-room);
    block-size: 100svh;
    overflow: clip;
  }

  .story__stage {
    grid-area: 1 / 1;
  }
}
</style>
