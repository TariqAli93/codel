<script setup lang="ts">
import { company, services } from "~/data/company";

// 05 Codel again: software made to measure, and how to reach us. The heading where every chapter's
// heading sits; the services where the window was, one at a time on the stage (one entry each as a
// page); then all of them, and the ways to reach us under them.

// The closing call's line: a draft of the owner's offer (see CLAUDE.md, Home page).
const customHeadline = "لم تجد برنامجك؟ نبرمجه لك.";

// A service's number in chapter 05, by its place in the list: 01, 02 and on.
const ordinal = (index: number) => String(index + 1).padStart(2, "0");
</script>

<template>
  <StoryChapter
    id="contact"
    name="custom"
    ground="lime"
    labelledby="custom-title"
  >
    <div class="home__closing">
      <HomeChapterHead
        index="05"
        kicker="خدماتنا"
        title-id="custom-title"
        :headline="customHeadline"
      >
        <template #lede>
          أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
          {{ company.hours.days }}، {{ company.hours.time }}.
        </template>
        <OpenStatus class="home__status" data-reveal />
      </HomeChapterHead>

      <!-- The services, one scene each: its number, its name, what it is, how to ask. On the
           stage they follow one another in one place, then the overview names them all. -->
      <div class="home__tour">
        <ol role="list" class="home__scenes">
          <HomeServiceScene
            v-for="(service, index) in services"
            :key="service.title"
            :service="service"
            :number="ordinal(index)"
            :data-scene="index + 1"
          />
        </ol>

        <!-- The overview: on the stage every service by name, each a link to its entry on
             /services, then the link to that page. As a page the entries above already are the
             names, so only the link shows. -->
        <div class="home__overview" data-scene="overview">
          <ul role="list" class="home__service-names" data-stage-only>
            <li
              v-for="(service, index) in services"
              :key="service.title"
              class="home__service"
              data-reveal
            >
              <!-- Kept on one line (and out of the formatter's reach): the space keeps the
                   number and the name apart. -->
              <!-- prettier-ignore -->
              <ActionLink look="text" :to="`/services#service-${index + 1}`"><span class="home__service-index" dir="ltr">{{ ordinal(index) }}</span> {{ service.title }}</ActionLink>
            </li>
          </ul>
          <ActionLink
            class="home__overview-link"
            look="text"
            to="/services"
            label="تفاصيل الخدمات"
            data-reveal
          />
        </div>
      </div>

      <div class="home__foot">
        <!-- The tour's progress on the stage: one leaning bar per service, filled as it shows. -->
        <div class="home__rail" aria-hidden="true" data-rail data-stage-only>
          <span
            v-for="service in services"
            :key="service.title"
            class="home__rail-bar"
            ><span class="home__rail-fill" data-rail-fill
          /></span>
        </div>
        <div class="home__reach" data-reveal data-scene="overview">
          <WhatsAppCall
            look="ink"
            :subject="services.at(-1)?.title"
            :detail="company.phones.main.display"
          />
          <ul role="list" class="home__channels">
            <li>
              <!-- Kept on one line (and out of the formatter's reach): the space keeps the words
                   and the number apart. -->
              <!-- prettier-ignore -->
              <ActionLink look="text" :to="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></ActionLink>
            </li>
            <li>
              <ActionLink
                look="text"
                :to="`mailto:${company.email}`"
                :label="company.email"
                dir="ltr"
              />
            </li>
            <li>
              <ActionLink look="text" to="/contact" label="كل طرق التواصل" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </StoryChapter>
</template>

<style scoped lang="scss">
@use "~/assets/scss/story" as *;

// ---------------------------------------------------------------------------
// 05 The closing call, on lime: the heading where every chapter's heading sits, the services where
// the window was (one at a time on the stage, one entry each as a page), the ways to reach us under
// them. Each service's scene is HomeServiceScene.
// ---------------------------------------------------------------------------

.home {
  &__closing {
    display: grid;
    row-gap: var(--space-8);

    // On the stage it fills the frame under the header in three rows: its heading in the headings'
    // band, on the same line as every chapter's; the tour in the room under it, where the window
    // was, each scene and the overview centred there; the rail, then the ways to reach us, at its
    // foot, at least a button high.
    .story--cinematic & {
      grid-template-rows:
        var(--head-h) minmax(0, 1fr)
        minmax(var(--control-lg), auto);
      row-gap: var(--head-gap);
      block-size: calc(100svh - var(--room-top));
      padding-block-end: var(--cover-pad);

      > .home__head {
        grid-row: 1;
        align-self: end;
      }

      > .home__tour {
        grid-row: 2;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);

        > .home__scenes,
        > .home__overview {
          grid-area: 1 / 1;
          align-self: center;
        }
      }

      > .home__foot {
        grid-row: 3;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        align-items: center;

        > .home__rail,
        > .home__reach {
          grid-area: 1 / 1;
        }
      }
    }
  }

  &__status {
    margin-block-start: calc(-1 * var(--space-2));
  }

  // The services as a numbered list, each entry under a rule: its number, then its name, what it is
  // and how to ask about it. From $tablet the number takes a column of its own.
  &__scenes {
    margin-block-start: var(--space-7);
    padding: 0;
    list-style: none;

    .story--cinematic & {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      margin: 0;
    }
  }

  // The stage's overview of names (data-stage-only): the five in two columns, each under a rule, each
  // a link to its entry on /services. One line per name, so the names compare at a glance; the last
  // row holds one name.
  &__service-names {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-6);
    padding: 0;
    list-style: none;
  }

  &__service {
    padding-block: var(--space-3);
    border-block-end: 1px solid var(--border);
    font-family: var(--font-display);
    font-size: var(--text-card);
    font-weight: 700;
    line-height: 1.4;

    // A short cover: the rows close up to the links' own 44px, so three rows and the link to the
    // services page fit the room between the heading and the ways to reach us (1024x600 too).
    @media #{$cover-short} {
      padding-block: 0;
    }

    // The link is set like the name it holds.
    > a {
      font-weight: inherit;
    }
  }

  &__service-index {
    margin-inline-end: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-ui);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
  }

  // As a page, the link to the services page follows the last entry; on the stage it sits under the
  // names (on a short cover right under them, see .home__service).
  &__overview-link {
    margin-block-start: var(--space-5);

    .story--cinematic & {
      margin-block-start: var(--space-3);

      @media #{$cover-short} {
        margin-block-start: 0;
      }
    }
  }

  // The tour's progress (stage only, data-stage-only): one short leaning bar per service, filled from
  // the reading start as its service shows; the bars already passed stay full.
  &__rail {
    display: flex;
    justify-content: start;
    gap: var(--space-2);
  }

  &__rail-bar {
    position: relative;
    inline-size: var(--space-6);
    block-size: var(--space-1);
    overflow: hidden;
    border-radius: var(--radius-pill);
    background-color: color-mix(in srgb, var(--on-accent) 28%, var(--accent));
    transform: $lean;
  }

  &__rail-fill {
    position: absolute;
    inset: 0;
    background-color: var(--on-accent);
  }

  // The call and the other ways in, on one line where there is room.
  &__reach {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);

    @media #{$cover-short} {
      row-gap: var(--space-2);
    }
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    padding: 0;
    list-style: none;
  }
}
</style>
