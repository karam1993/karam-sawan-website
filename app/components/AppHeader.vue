<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'

const { locale, setLocale, locales } = useI18n()
const isScrolled = ref(false)
const activeSection = ref('about')

const navItems = [
  { id: 'about' },
  { id: 'skills' },
  { id: 'projects' },
  { id: 'experience' },
  { id: 'contact' }
]

const getSectionIcon = (id) => {
  return {
    about: 'mdi-account-outline',
    skills: 'mdi-code-tags',
    projects: 'mdi-folder-outline',
    experience: 'mdi-school-outline',
    contact: 'mdi-email-outline'
  }[id] || 'mdi-help-circle-outline'
}

const changeLang = (code) => {
  setLocale(code)
  isLangDropdownOpen.value = false
}

// Navigation elements references for interactive sliding pill
const navRef = ref(null)
const navItemRefs = reactive({})
const pillStyle = ref({
  width: '0px',
  transform: 'translateX(0px)',
  opacity: 0
})

// Update sliding pill size and position
const updatePillPosition = (id) => {
  const el = navItemRefs[id]
  if (el) {
    pillStyle.value = {
      width: `${el.offsetWidth}px`,
      transform: `translateX(${el.offsetLeft}px)`,
      opacity: 1
    }
  } else {
    pillStyle.value.opacity = 0
  }
}

const hoverPill = (id) => {
  updatePillPosition(id)
}

const resetPill = () => {
  if (activeSection.value) {
    updatePillPosition(activeSection.value)
  } else {
    pillStyle.value.opacity = 0
  }
}

// Track page scroll to shrink & float navbar
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20

  // Scrollspy logic
  const scrollPosition = window.scrollY + 120
  for (const item of navItems) {
    const el = document.getElementById(item.id)
    if (el) {
      const top = el.offsetTop
      const height = el.offsetHeight
      if (scrollPosition >= top && scrollPosition < top + height) {
        activeSection.value = item.id
      }
    }
  }
}

const isMobileMenuOpen = ref(false)
const isLangDropdownOpen = ref(false)
const langDropdownRef = ref(null)

const handleClickOutside = (event) => {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target)) {
    isLangDropdownOpen.value = false
  }
}

const handleMobileLinkClick = (e, id) => {
  scrollToSection(e, id)
  isMobileMenuOpen.value = false
}

// Custom smooth scroll that accounts for navbar height
const scrollToSection = (e, id) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (el) {
    const offset = isScrolled.value ? 75 : 85
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = el.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Watch active section to slide pill automatically
watch(activeSection, (newSection) => {
  updatePillPosition(newSection)
})

// Watch locale to adapt pill size after translation changes the width
watch(locale, () => {
  setTimeout(() => {
    updatePillPosition(activeSection.value)
  }, 100)
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  handleScroll() // initial call
  setTimeout(() => {
    updatePillPosition(activeSection.value)
  }, 150)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div>
    <!-- Interactive Header -->
    <header class="header-container" :class="{ 'scrolled': isScrolled }">
      <div class="header-content d-flex align-center justify-space-between">
        <!-- Logo Brand -->
        <div class="d-flex align-center brand-wrapper pr-0" @click="window.scrollTo({ top: 0, behavior: 'smooth' })">
          <v-avatar size="36" class="logo-avatar">
            <img src="/images/my-image.jpg" alt="Karam Sawan" style="width: 100%; height: 100%; object-fit: cover;" />
          </v-avatar>
          <span class="text-subtitle-1 font-weight-black text-white logo-text ml-2 mr-2 d-none d-sm-inline-block">
            {{ $t('nav.brand') }}
          </span>
        </div>

        <!-- Desktop Navigation Menu (Premium Sliding Pill style) -->
        <nav 
          class="align-center nav-links-container"
          ref="navRef"
          @mouseleave="resetPill"
        >
          <!-- Sliding Indicator Pill -->
          <div class="sliding-pill" :style="pillStyle"></div>

          <a
            v-for="section in navItems"
            :key="section.id"
            :ref="el => navItemRefs[section.id] = el"
            :href="`#${section.id}`"
            class="nav-item-link"
            :class="{ 'active': activeSection === section.id }"
            @mouseenter="hoverPill(section.id)"
            @click="scrollToSection($event, section.id)"
          >
            {{ $t(`nav.${section.id}`) }}
          </a>
        </nav>

        <!-- Right Side Controls (Language switcher + burger menu on mobile) -->
        <div class="d-flex align-center pl-2">
          <!-- Glass Language Dropdown -->
          <div class="lang-dropdown-container mr-2 ml-2" ref="langDropdownRef">
            <button 
              class="lang-dropdown-trigger" 
              @click="isLangDropdownOpen = !isLangDropdownOpen"
              aria-label="Select Language"
            >
              <span class="active-lang-code">{{ locale.toUpperCase() }}</span>
              <v-icon icon="mdi-chevron-down" size="14" class="chevron-icon" :class="{ 'rotated': isLangDropdownOpen }"></v-icon>
            </button>

            <transition name="lang-fade">
              <div v-if="isLangDropdownOpen" class="lang-dropdown-menu">
                <button
                  v-for="item in locales"
                  :key="item.code"
                  class="lang-dropdown-item"
                  :class="{ 'active': locale === item.code }"
                  @click="changeLang(item.code)"
                >
                  {{ item.name }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Mobile Burger Menu Toggle Button (Custom Animated CSS Icon) -->
          <button 
            class="mobile-menu-toggle-btn ml-2 mr-2"
            :class="{ 'is-active': isMobileMenuOpen }"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            :aria-label="isMobileMenuOpen ? 'Close Menu' : 'Open Menu'"
          >
            <span class="hamburger-line line-1"></span>
            <span class="hamburger-line line-2"></span>
            <span class="hamburger-line line-3"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu (Fades & slides down from header) -->
      <transition name="dropdown-slide">
        <div v-if="isMobileMenuOpen" class="mobile-dropdown-menu d-md-none">
          <a
            v-for="section in navItems"
            :key="section.id"
            :href="`#${section.id}`"
            class="mobile-dropdown-item"
            :class="{ 'active': activeSection === section.id }"
            @click="handleMobileLinkClick($event, section.id)"
          >
            <v-icon :icon="getSectionIcon(section.id)" class="mr-2 ml-2" size="18"></v-icon>
            {{ $t(`nav.${section.id}`) }}
          </a>
        </div>
      </transition>
    </header>
  </div>
</template>

<style scoped>
/* Base Header Container */
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px 40px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: rgba(8, 12, 21, 0);
  border: 1px solid transparent;
  border-radius: 40px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-wrapper {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-wrapper:hover {
  transform: scale(1.02);
}

.logo-avatar {
  border: 1px solid rgba(122, 255, 251, 0.3);
  box-shadow: 0 0 10px rgba(122, 255, 251, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.brand-wrapper:hover .logo-avatar {
  border-color: #7afffb;
  box-shadow: 0 0 15px rgba(122, 255, 251, 0.3);
}

/* Desktop Navigation Menu (Sliding pill style) */
.nav-links-container {
  position: relative;
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 30px;
  backdrop-filter: blur(8px);
}

.sliding-pill {
  position: absolute;
  top: 4px;
  left: 0;
  height: calc(100% - 8px);
  background: rgba(122, 255, 251, 0.08);
  border: 1px solid rgba(122, 255, 251, 0.22);
  box-shadow: 0 0 12px rgba(122, 255, 251, 0.08);
  border-radius: 20px;
  transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
  z-index: 0;
}

.nav-item-link {
  position: relative;
  z-index: 1;
  text-decoration: none;
  color: #94A3B8;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  transition: color 0.3s ease;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.nav-item-link:hover {
  color: #FFFFFF;
}

.nav-item-link.active {
  color: #7afffb;
  text-shadow: 0 0 4px rgba(122, 255, 251, 0.25);
}

/* Floating Scrolled State */
.header-container.scrolled {
  top: 15px;
  padding: 0 20px;
}

.header-container.scrolled .header-content {
  background: rgba(11, 15, 25, 0.45); /* Highly translucent to allow the blur to be visible */
  backdrop-filter: blur(28px) saturate(190%); /* Strong blur and saturation boost for vibrant glass feel */
  border-color: rgba(122, 255, 251, 0.22); /* Subtle neon highlight on the edge */
  border-radius: 40px;
  padding: 10px 24px;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15), /* Inner glass sheen */
    inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    0 15px 35px rgba(0, 0, 0, 0.5); /* Outer ambient shadow */
}

/* Glass Language Dropdown */
.lang-dropdown-container {
  position: relative;
  display: inline-block;
}

.lang-dropdown-trigger {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 6px 14px;
  color: #E2E8F0;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.lang-dropdown-trigger:hover {
  background: rgba(122, 255, 251, 0.08);
  border-color: rgba(122, 255, 251, 0.3);
  color: #7afffb;
}

.chevron-icon {
  transition: transform 0.3s ease;
  color: #94A3B8;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  color: #7afffb;
}

.lang-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(11, 15, 25, 0.85);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(122, 255, 251, 0.2);
  border-radius: 16px;
  padding: 6px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1050;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    0 10px 25px rgba(0, 0, 0, 0.5);
}

/* RTL layout adjustment for absolute positioning */
[dir="rtl"] .lang-dropdown-menu {
  right: auto;
  left: 0;
}

.lang-dropdown-item {
  background: transparent;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  color: #94A3B8;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  width: 100%;
}

[dir="rtl"] .lang-dropdown-item {
  text-align: right;
}

.lang-dropdown-item:hover,
.lang-dropdown-item.active {
  color: #7afffb;
  background: rgba(122, 255, 251, 0.08);
}

/* Dropdown Animation */
.lang-fade-enter-active,
.lang-fade-leave-active {
  transition: all 0.25s ease;
}

.lang-fade-enter-from,
.lang-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsiveness adjustments */
@media (max-width: 768px) {
  .header-container {
    padding: 15px 20px;
  }
  .header-container.scrolled {
    top: 10px;
    padding: 0 16px; /* balanced margin on mobile */
  }
  .header-container.scrolled .header-content {
    padding: 8px 12px;
    border-radius: 30px;
  }
  /* Hide the desktop nav links container on mobile to prevent overflow */
  .nav-links-container {
    display: none !important;
  }
  /* Show burger menu only on mobile */
  .mobile-menu-toggle-btn {
    display: flex !important;
  }
}

/* Custom Animated Hamburger Button */
.mobile-menu-toggle-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: none; /* Hidden on desktop/tablet by default */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  z-index: 1010;
}

.mobile-menu-toggle-btn:hover {
  background: rgba(122, 255, 251, 0.08);
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #94A3B8;
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.3s ease;
}

/* Active State (Transforms 3 lines into an 'X') */
.mobile-menu-toggle-btn.is-active .hamburger-line {
  background-color: #7afffb; /* Glow color on active */
}

.mobile-menu-toggle-btn.is-active .line-1 {
  transform: translateY(7px) rotate(45deg);
}

.mobile-menu-toggle-btn.is-active .line-2 {
  opacity: 0;
}

.mobile-menu-toggle-btn.is-active .line-3 {
  transform: translateY(-7px) rotate(-45deg);
}

.mobile-dropdown-menu {
  width: 100%;
  background: rgba(11, 15, 25, 0.45);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(122, 255, 251, 0.22);
  border-radius: 24px;
  padding: 12px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    0 15px 35px rgba(0, 0, 0, 0.5);
}

.mobile-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #94A3B8;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.mobile-dropdown-item:hover,
.mobile-dropdown-item.active {
  color: #7afffb;
  background: rgba(122, 255, 251, 0.08);
  text-shadow: 0 0 5px rgba(122, 255, 251, 0.2);
}

/* Transition for mobile dropdown */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
