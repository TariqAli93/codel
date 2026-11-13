/// <reference types="gsap" />
import {
  beats,
  chapterNames,
  focus,
  isChapterName,
  tour,
  type Beat,
  type ChapterName,
} from "./storyConfig";
import {
  customTour,
  dalalyToCustom,
  insightsToDalaly,
  introToNuqta,
  nuqtaToInsights,
  type Scene,
  type Stage,
} from "./storyHandOvers";
import { readSlant, type Gsap, type ScrollTriggerApi } from "./storyParts";
import { timelineTools } from "./storyTimeline";

// The cinematic stage (a desktop-sized window, motion allowed): one scrubbed timeline, on one
// ScrollTrigger over the whole story, hands the stage and the text from chapter to chapter.

export function playCinematic(
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
  const slant = readSlant(story);
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

  // The moves the hand-overs are written in: play, between, handOver, leave, arrive and sweep
  // (storyTimeline).
  const moves = timelineTools(tl, slant);

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

  const stage: Stage = {
    ...moves,
    tl,
    all,
    chapters,
    parts: {
      cameraNuqta,
      cameraDalaly,
      slab,
      light,
      insights,
      report,
      dalalyWorld,
      detail,
      limeScreen,
      lime,
      mark,
      operationsImage,
      insightsImage,
      listingImage,
      rail,
      fills,
    },
    services,
    overview,
    flat,
    tilted,
    tilt,
    windowBox,
  };
  // The hand-overs (storyHandOvers), in reading order. A scrubbed timeline's result depends on the
  // order its tweens are added in, so keep this one.
  introToNuqta(stage);
  nuqtaToInsights(stage);
  insightsToDalaly(stage);
  dalalyToCustom(stage);
  customTour(stage);

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
