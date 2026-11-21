<script setup lang="ts">
import { company } from "~/data/company";
import { solutions, type Solution, type SolutionImage } from "~/data/solutions";
import type { StageShots } from "~/components/StoryStage.vue";

// The story's stage runs to the window edges, so this page draws its own full-width sections instead
// of the layout's centred column.
definePageMeta({ fullWidth: true });

const title = "الرئيسية / Home";
const description =
  "كودل شركة برمجيات عراقية في بغداد: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج جاهزة مثل نقطة بلس ودلالي، إدارة السيرفرات، وخدمات برمجية حسب الطلب.";

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

// Structured data for search engines: only the facts in app/data/company.ts.
const organization = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: company.name,
  telephone: company.phones.main.tel.replace("tel:", ""),
  email: company.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: company.addressParts.countryCode,
    addressLocality: company.addressParts.city,
    streetAddress: company.addressParts.district,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes,
    },
  ],
};

// The opening is set in its own face (--font-hero, main.scss) and its headline is the page's largest
// paint: ask for the font early, on this page only.
useHead({
  script: [
    { type: "application/ld+json", innerHTML: JSON.stringify(organization) },
  ],
  link: [
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: "/fonts/NotoSansArabic-Variable.woff2",
      crossorigin: "anonymous",
    },
  ],
});

// ---------------------------------------------------------------------------
// The story: five chapters, from Codel to its two ready-made programs and back to Codel.
// 01 Codel (HomeIntro) · 02 Nuqta Plus at the point of sale · 03 the same program's figures and
// reports · 04 Dalaly · 05 software made to measure, and the call (HomeServices).
// The chapters are written about these two products, so they are picked by slug; every product
// (these and any added later) is listed on /solutions.
// ---------------------------------------------------------------------------

const nuqta = solutions.find((solution) => solution.slug === "nuqta-plus");
const dalaly = solutions.find((solution) => solution.slug === "dalaly");

// A product's screenshot by file name, so each screen keeps its part if the list is reordered.
const screen = (
  solution: Solution | undefined,
  file: string,
): SolutionImage | undefined =>
  solution?.images.find((image) => image.src.endsWith(`/${file}`));

// The cinematic stage's screens (StoryStage), by the part each plays. None of them is the opening's
// picture: that is its own stack of layers (HomeIntro), and the stage's window waits under it.
const shots: StageShots = {
  operations: screen(nuqta, "pos.webp"),
  insights: screen(nuqta, "dashboard.webp"),
  report: screen(nuqta, "sales-report.webp"),
  listing: screen(dalaly, "properties.webp"),
  detail: screen(dalaly, "property.webp"),
};

// As a page, each chapter shows its own screens; chapter 02's is the stock screen (on the stage,
// the window shows the point of sale).
const stock = screen(nuqta, "inventory.webp");

// Chapter 03's line: a draft of the owner's offer (see CLAUDE.md, Home page), like its sentence in
// the template.
const insightsHeadline = "من نقطة البيع، إلى أرقام يومك.";
</script>

<template>
  <div class="home">
    <HomeStory :shots="shots">
      <!-- 01 Codel: the offer, beside the layers it is built in. -->
      <HomeIntro />

      <!-- 02 Nuqta Plus: what it is, at its point of sale. Who it is on the reading side; what it
           costs and how to ask on the other. -->
      <StoryChapter v-if="nuqta" name="nuqta" labelledby="nuqta-title">
        <HomeChapterHead
          index="02"
          kicker="برنامج جاهز"
          title-id="nuqta-title"
          :product="nuqta"
        />

        <template v-if="stock" #media>
          <HomeChapterMedia :main="stock" focus="stock" />
        </template>
      </StoryChapter>

      <!-- 03 The same program, from daily operations to the day's figures. -->
      <StoryChapter v-if="nuqta" name="insights" labelledby="insights-title">
        <HomeChapterHead
          index="03"
          :kicker="nuqta.nameAr"
          title-id="insights-title"
          :headline="insightsHeadline"
        >
          <template #lede>
            مبيعات اليوم وأرباحه وفواتيره على الشاشة الرئيسية، والتقارير
            المالية وتقارير المبيعات حين تحتاجها.
          </template>
        </HomeChapterHead>

        <template v-if="shots.insights" #media>
          <HomeChapterMedia
            :main="shots.insights"
            :second="shots.report"
            focus="insights"
          />
        </template>
      </StoryChapter>

      <!-- 04 Dalaly: another business, on its own sand ground. -->
      <StoryChapter
        v-if="dalaly"
        name="dalaly"
        ground="sand"
        labelledby="dalaly-title"
      >
        <HomeChapterHead
          index="04"
          kicker="برنامج جاهز"
          title-id="dalaly-title"
          :product="dalaly"
        />

        <template v-if="shots.listing" #media>
          <HomeChapterMedia
            :main="shots.listing"
            :second="shots.detail"
            focus="listing"
          />
        </template>
      </StoryChapter>

      <!-- 05 Codel again: software made to measure, and how to reach us. -->
      <HomeServices />
    </HomeStory>
  </div>
</template>

<style scoped lang="scss">
.home {
  overflow-x: clip;
}
</style>
