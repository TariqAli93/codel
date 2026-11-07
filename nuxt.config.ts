// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Generates `strict: true` in the .nuxt/tsconfig.*.json files
  // that the root tsconfig.json references.
  typescript: {
    strict: true
  },

  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
        // Dark is the default theme. The light theme exists in main.scss but is not switched on yet.
        'data-theme': 'dark'
      },
      // Every title ends with " | Codel - كودل". A page without its own title (the static 404.html and
      // 200.html shells) shows just "Codel - كودل": the separator is dropped when %s is empty.
      titleTemplate: '%s %separator %siteName',
      templateParams: { separator: '|', siteName: 'Codel - كودل' },
      meta: [
        // Same value as --bg (charcoal-900) in the dark theme
        { name: 'theme-color', content: '#101411' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Fonts are self-hosted in public/fonts (see main.scss for the @font-face rules)
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Rubik-Variable.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/ReadexPro-Variable.woff2', crossorigin: 'anonymous' }
      ]
    }
  }
})
