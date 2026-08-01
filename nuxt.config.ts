export default defineNuxtConfig({
  compatibilityDate: '2026-07-31',
  modules: ['@nuxt/content', '@nuxtjs/seo'],

  content: {
    // SQLite natif de Node (>= 22.5) : évite la dépendance native better-sqlite3.
    experimental: { nativeSqlite: true },
  },

  site: {
    // Obligatoire pour @nuxtjs/seo : sitemap et canoniques en absolu.
    // Valeur distincte en préprod, injectée par la CI via NUXT_PUBLIC_SITE_URL.
    url: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://brendanfleurdelys.ch',
    name: 'Brendan Fleurdelys — Photographie animalière',
    // NUXT_SITE_ENV=preview en préprod → robots.txt bloquant, pas d'indexation.
    indexable: (process.env.NUXT_SITE_ENV ?? 'production') === 'production',
  },
})
