<script setup>
// Get localized SEO tags, hreflang links, HTML lang/dir attributes
const i18nHead = useLocaleHead({
  addSeoAttributes: true,
  addDirAttribute: true
})

// Feed them to Nuxt's useHead so they update dynamically on language switch
useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
}))
</script>

<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<style>
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
}
</style>
