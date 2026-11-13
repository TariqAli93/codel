/// <reference types="gsap" />
import { focus, tour, type Beat, type ChapterName } from "./storyConfig";
import { some } from "./storyParts";
import type { TimelineTools } from "./storyTimeline";

// The cinematic stage's hand-overs, one function each: from chapter to chapter, then chapter 05's
// tour of its services. Each writes its tweens onto the stage's one scrubbed timeline, so
// playCinematic runs them in reading order.

// One of chapter 05's scenes (data-scene): a service, or the overview, with its beat (see tour).
export interface Scene extends Beat {
  name: string;
  parts: HTMLElement[];
}

// The stage's parts that the hand-overs move (StoryStage's data-stage, the screens' images the
// camera leans in on, the tour's rail and its bars). A part this page does not have is null or
// undefined.
export interface StageParts {
  cameraNuqta: HTMLElement | undefined;
  cameraDalaly: HTMLElement | undefined;
  slab: HTMLElement | null;
  light: HTMLElement | null;
  insights: HTMLElement | null;
  report: HTMLElement | null;
  dalalyWorld: HTMLElement | null;
  detail: HTMLElement | null;
  limeScreen: HTMLElement | null;
  lime: HTMLElement | null;
  mark: HTMLElement | null;
  operationsImage: HTMLElement | null;
  insightsImage: HTMLElement | null;
  listingImage: HTMLElement | null;
  rail: HTMLElement | null;
  fills: Map<string, HTMLElement>;
}

// What every hand-over below works with, made once per run by playCinematic (storyCinematic): the
// timeline and its moves (storyTimeline), the chapters, the stage's parts, chapter 05's scenes and
// the window's poses.
export interface Stage extends TimelineTools {
  tl: gsap.core.Timeline;
  all: (selector: string, scope?: Element) => HTMLElement[];
  chapters: Record<ChapterName, HTMLElement | null>;
  parts: StageParts;
  services: Scene[];
  overview: Scene | undefined;
  flat: gsap.TweenVars;
  tilted: gsap.TweenVars;
  tilt: (name: string) => () => number;
  windowBox: () => string;
}

// 01 → 02. The lime slab steps aside along its lean while the window rises and turns to face you:
// Codel hands the stage to Nuqta Plus's point of sale. The camera then leans in on the
// product cards and the cart, the work of the day.
export function introToNuqta(stage: Stage) {
  const { tl, all, chapters, play, handOver, leave, arrive } = stage;
  const { flat, tilted, tilt } = stage;
  const { cameraNuqta, slab, light, operationsImage } = stage.parts;
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
  // One light at a time: the opening's glow (HomeIntro's light and its shade) fades out as Nuqta
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
export function nuqtaToInsights(stage: Stage) {
  const { chapters, play, handOver, leave, arrive, sweep } = stage;
  const { insights, report, operationsImage, insightsImage } = stage.parts;
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
export function insightsToDalaly(stage: Stage) {
  const { chapters, play, handOver, leave, arrive, sweep } = stage;
  const { cameraNuqta, cameraDalaly, light, report, dalalyWorld, detail } =
    stage.parts;
  const { insightsImage, listingImage } = stage.parts;
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
export function dalalyToCustom(stage: Stage) {
  const { chapters, play, handOver, leave, arrive, sweep, windowBox } = stage;
  const { detail, limeScreen, lime, mark, listingImage, rail } = stage.parts;
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
export function customTour(stage: Stage) {
  const { services, overview, play, between, leave, arrive, sweep } = stage;
  const { rail, fills } = stage.parts;
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
      fills.get(scene.name),
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
  if (overview) {
    // With no services the call still arrives after the closing chapter's heading. For a tour,
    // preserve the authored last-service hand-over exactly.
    const { prepare, resolve } = between(
      last ? last.rest + last.hold : overview.rest - tour.handOver,
      overview.rest,
    );
    last?.parts.forEach((element) => leave(element, prepare));
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
