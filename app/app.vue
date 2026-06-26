<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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

// Global Mouse Tracking for Particle Gravity Field
const mouseX = ref(-1000)
const mouseY = ref(-1000)

const handleMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const handleMouseLeave = () => {
  mouseX.value = -1000
  mouseY.value = -1000
}

const mouseGlowStyle = computed(() => {
  return {
    left: `${mouseX.value}px`,
    top: `${mouseY.value}px`
  }
})

// Global Particle Gravity Field Logic
const canvasRef = ref(null)
let animationFrameId = null
const particles = []

class Particle {
  constructor(originX, originY) {
    this.originX = originX
    this.originY = originY
    this.x = originX + (Math.random() * 20 - 10)
    this.y = originY + (Math.random() * 20 - 10)
    this.vx = 0
    this.vy = 0
    this.size = Math.random() * 1.5 + 1.2
    this.color = Math.random() > 0.2 ? 'rgba(122, 255, 251, 0.65)' : 'rgba(99, 102, 241, 0.65)'
    this.ease = 0.05 + Math.random() * 0.04
    this.friction = 0.85 + Math.random() * 0.05
    this.currentScale = 1 // Track dynamic scale factor for gravity feedback
  }

  update(mx, my, isMouseActive) {
    let dx = mx - this.x
    let dy = my - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    let force = 0
    const inPullZone = isMouseActive && dist < 220
    let targetScale = 1

    if (inPullZone) {
      force = (220 - dist) / 220
      let accel = force * 2.5
      this.vx += (dx / dist) * accel
      this.vy += (dy / dist) * accel
      targetScale = 1 + force * 1.5 // Scale up to 150% larger when closest to the cursor
    }

    // Smoothly interpolate the scale transition
    this.currentScale += (targetScale - this.currentScale) * 0.1

    // Constant organic vibration (Brownian motion style) for all particles at all times
    this.vx += (Math.random() * 0.76 - 0.38)
    this.vy += (Math.random() * 0.76 - 0.38)

    this.vx += (this.originX - this.x) * this.ease
    this.vy += (this.originY - this.y) * this.ease

    this.vx *= this.friction
    this.vy *= this.friction
    this.x += this.vx
    this.y += this.vy
  }

  draw(ctx) {
    ctx.beginPath()
    const currentSize = this.size * this.currentScale
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 0.4) {
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5)
      ctx.strokeStyle = this.color
      ctx.lineWidth = currentSize
      ctx.lineCap = 'round'
      ctx.stroke()
    } else {
      ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    }
  }
}

const initParticles = (width, height) => {
  particles.length = 0
  const spacing = 39
  const cols = Math.floor(width / spacing)
  const rows = Math.floor(height / spacing)
  const xSpacing = width / (cols + 1)
  const ySpacing = height / (rows + 1)

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const originX = c * xSpacing
      const originY = r * ySpacing
      particles.push(new Particle(originX, originY))
    }
  }
}

const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles(canvas.width, canvas.height)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('resize', handleResize)

  // Start Canvas Particles Loop
  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    handleResize()

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isMouseActive = mouseX.value !== -1000 && mouseY.value !== -1000

      particles.forEach(p => {
        p.update(mouseX.value, mouseY.value, isMouseActive)
        p.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(loop)
    }
    loop()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', handleMouseLeave)
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <v-app class="app-root-container">
    <!-- Global Interactive Background Particles Canvas -->
    <canvas ref="canvasRef" class="global-bg-canvas"></canvas>

    <!-- Global Ambient Background Glows -->
    <div class="global-ambient-glow primary-glow"></div>
    <div class="global-ambient-glow secondary-glow"></div>
    <div class="global-mouse-glow" :style="mouseGlowStyle" v-if="mouseX !== -1000"></div>

    <NuxtRouteAnnouncer />
    <AppHeader />
    <v-main class="main-content-layout">
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
  background-color: #0B0F19;
}

/* Override Vuetify default layout overflow rules to allow position: sticky */
.v-application,
.v-application__wrap,
.v-layout {
  overflow: visible !important;
}

/* Global Application background container */
.app-root-container {
  background-color: #0B0F19 !important;
  color: #FFFFFF;
  position: relative;
  min-height: 100vh;
}

.main-content-layout {
  position: relative;
  z-index: 10; /* Keeps page content clickable above canvas background */
  background: transparent !important;
}

/* Make containers wider on desktop & tablet screens */
@media (min-width: 960px) {
  .v-container {
    max-width: 92% !important;
  }
}
@media (min-width: 1280px) {
  .v-container {
    max-width: 1440px !important;
  }
  .header-content {
    max-width: 1440px !important;
  }
}
@media (min-width: 1600px) {
  .v-container {
    max-width: 1560px !important;
  }
  .header-content {
    max-width: 1560px !important;
  }
}
@media (min-width: 1920px) {
  .v-container {
    max-width: 1780px !important;
  }
  .header-content {
    max-width: 1780px !important;
  }
}
</style>

<style scoped>
/* Global Particle Canvas styles */
.global-bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1; /* Above body background, below page content */
  pointer-events: none;
}

/* Global Ambient Glows */
.global-ambient-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  z-index: 1;
}

.primary-glow {
  top: -10%;
  right: -5%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(122, 255, 251, 0.08) 0%, transparent 70%);
}

.secondary-glow {
  bottom: -10%;
  left: -5%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
}

.global-mouse-glow {
  position: fixed;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(122, 255, 251, 0.065) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: opacity 0.3s ease;
}
</style>
