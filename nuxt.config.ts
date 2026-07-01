// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      formspreeId: 'xvzjwaye'
    }
  },
  app: {
    head: {
      title: 'كرم صوان | Karam Sawan',
      meta: [
        { name: 'description', content: 'Karam Sawan - Full-Stack Web Developer Portfolio' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Outfit:wght@300;400;600;700;900&display=swap' }
      ]
    }
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  modules: ['vuetify-nuxt-module', '@nuxtjs/i18n'],
  i18n: {
    baseUrl: 'https://karam-sawan.online', // placeholder URL for SEO canonical links
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
      { code: 'ar', language: 'ar-EG', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json', dir: 'ltr' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    lazy: true,
    langDir: 'locales', // relative to srcDir (which is 'app' in Nuxt 4)
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  vuetify: {
    moduleOptions: {
      /* module options */
      useIconCDNs: false,
    },
    vuetifyOptions: {
      /* vuetify options */
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            dark: true,
            colors: {
              background: '#0B0F19', // Deep dark blue-grey
              surface: '#111827',    // Sleek dark surface (gray-900)
              primary: '#7afffb',    // Radiant Ice Blue / Cyan
              secondary: '#6366F1',  // Indigo accent
              accent: '#D946EF',     // Fuchsia accent
              error: '#F43F5E',
              info: '#38BDF8',
              success: '#10B981',
              warning: '#F59E0B',
            }
          }
        }
      }
    }
  }
})