import { onBeforeUnmount, onMounted, type Ref } from "vue";
import { cinematicFits, playCinematic } from "./storyCinematic";
import { coverQuery, motionQuery } from "./storyConfig";
import { playPage } from "./storyPage";

// The home page's story's motion, set up after mount and cleaned up on unmount: the cinematic
// stage (storyCinematic) or the page's reveals (storyPage), whichever the window and the visitor
// allow.

// Call it once, synchronously, in the setup of the story's component (HomeStory), with its root
// element: it starts fetching GSAP there.
export function useStoryMotion(root: Ref<HTMLElement | null>) {
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
        if (!conditions.motion) return undefined;

        let mode: boolean | undefined;
        let current: ReturnType<typeof gsap.context> | undefined;
        let resizeFrame = 0;
        const chooseMode = () => {
          resizeFrame = 0;
          const cinematic = !!conditions.cinematic && cinematicFits(story);
          if (cinematic === mode) return;
          current?.revert();
          mode = cinematic;
          // This mode has its own context because resize may replace it while the media query
          // still matches. Its explicit cleanup below avoids retaining old mode contexts.
          context.ignore(() => {
            current = gsap.context(
              () =>
                cinematic
                  ? playCinematic(story, gsap, ScrollTrigger)
                  : playPage(story, gsap, ScrollTrigger),
              story,
            );
          });
          ScrollTrigger.refresh();
        };
        const onResize = () => {
          if (!resizeFrame) resizeFrame = requestAnimationFrame(chooseMode);
        };
        chooseMode();
        if (conditions.cinematic) window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          if (resizeFrame) cancelAnimationFrame(resizeFrame);
          current?.revert();
        };
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
}
