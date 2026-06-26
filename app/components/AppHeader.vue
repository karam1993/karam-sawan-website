<script setup>
import { ref, computed } from 'vue'

// Use official i18n tools
const { locale, setLocale, locales } = useI18n()
const isMenuOpen = ref(false)

const changeLang = (code) => {
  setLocale(code)
  isMenuOpen.value = false
}

// Find current locale's friendly name
const currentLocaleName = computed(() => {
  const matched = locales.value.find(l => l.code === locale.value)
  return matched ? matched.name : 'English'
})
</script>

<template>
  <div>
    <!-- Navigation Header -->
    <v-app-bar flat class="navbar" height="70">
      <v-container class="d-flex align-center justify-space-between py-0">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="40" class="mr-2 ml-2 logo-avatar">
            <span class="text-h6 font-weight-bold text-primary">KS</span>
          </v-avatar>
          <span class="text-h6 font-weight-black text-white logo-text">
            {{ $t('nav.brand') }}
          </span>
        </div>

        <!-- Desktop Navigation menu -->
        <div class="d-none d-md-flex align-center nav-links">
          <v-btn variant="text" href="#about" class="nav-link text-capitalize">{{ $t('nav.about') }}</v-btn>
          <v-btn variant="text" href="#skills" class="nav-link text-capitalize">{{ $t('nav.skills') }}</v-btn>
          <v-btn variant="text" href="#projects" class="nav-link text-capitalize">{{ $t('nav.projects') }}</v-btn>
          <v-btn variant="text" href="#experience" class="nav-link text-capitalize">{{ $t('nav.experience') }}</v-btn>
          <v-btn variant="text" href="#contact" class="nav-link text-capitalize">{{ $t('nav.contact') }}</v-btn>
        </div>

        <div class="d-flex align-center">
          <!-- Language Selector Dropdown -->
          <v-menu transition="slide-y-transition">
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                variant="outlined"
                class="mr-2 ml-2 lang-btn text-capitalize"
                v-bind="props"
                prepend-icon="mdi-translate"
                size="small"
              >
                {{ currentLocaleName }}
              </v-btn>
            </template>
            <v-list bg-color="surface" class="py-1">
              <v-list-item
                v-for="item in locales"
                :key="item.code"
                @click="changeLang(item.code)"
                :active="locale === item.code"
                active-color="primary"
                density="compact"
              >
                <v-list-item-title class="text-caption font-weight-bold">{{ item.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Mobile Hamburger icon -->
          <v-app-bar-nav-icon class="d-md-none ml-1 mr-1" color="white" @click="isMenuOpen = !isMenuOpen"></v-app-bar-nav-icon>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="isMenuOpen" temporary position="right" color="surface" width="280">
      <v-list nav class="mt-4">
        <v-list-item href="#about" prepend-icon="mdi-account-outline" :title="$t('nav.about')" @click="isMenuOpen = false"></v-list-item>
        <v-list-item href="#skills" prepend-icon="mdi-code-tags" :title="$t('nav.skills')" @click="isMenuOpen = false"></v-list-item>
        <v-list-item href="#projects" prepend-icon="mdi-briefcase-outline" :title="$t('nav.projects')" @click="isMenuOpen = false"></v-list-item>
        <v-list-item href="#experience" prepend-icon="mdi-timeline-outline" :title="$t('nav.experience')" @click="isMenuOpen = false"></v-list-item>
        <v-list-item href="#contact" prepend-icon="mdi-email-outline" :title="$t('nav.contact')" @click="isMenuOpen = false"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
/* Navbar glassmorphism */
.navbar {
  background: rgba(11, 15, 25, 0.7) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  z-index: 1000 !important;
}

.nav-link {
  color: #94A3B8 !important;
  font-weight: 600 !important;
  transition: all 0.3s ease;
  margin: 0 4px;
}

.nav-link:hover {
  color: var(--v-theme-primary) !important;
  background: rgba(122, 255, 251, 0.05) !important;
}

.lang-btn {
  border-radius: 8px !important;
  font-weight: bold !important;
}
</style>
