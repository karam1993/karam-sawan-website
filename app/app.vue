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
let sphereRotationX = 0
let sphereRotationY = 0

class Particle {
  constructor(originX, originY) {
    this.originX = originX
    this.originY = originY
    this.x = originX + (Math.random() * 40 - 20)
    this.y = originY + (Math.random() * 40 - 20)
    this.vx = 0
    this.vy = 0
    this.size = Math.random() * 1.5 + 1.2
    this.color = Math.random() > 0.2 ? 'rgba(122, 255, 251, 0.65)' : 'rgba(99, 102, 241, 0.65)'
    this.ease = 0.03 + Math.random() * 0.03
    this.friction = 0.85 + Math.random() * 0.05
    this.currentScale = 1
    this.currentAlpha = 1
    
    // Orbital motion variables to give a floating/drifting feel
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = 0.003 + Math.random() * 0.007
    this.orbitRadius = 15 + Math.random() * 30

    // 3D Spherical coordinates relative to the mouse
    this.phi = Math.random() * Math.PI * 2
    this.theta = Math.acos(Math.random() * 2 - 1) // Uniform distribution on sphere
    this.sphereRadius = 45 + Math.random() * 30 // Radius of the 3D sphere

    // Explosion animation parameters
    this.explosionTimer = 0
    this.recoveryEase = 1.0 // Smooth scaling ease after an explosion
  }

  explode(ex, ey) {
    const dx = this.x - ex
    const dy = this.y - ey
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) dist = 1

    const explosionRange = 250
    if (dist < explosionRange) {
      const force = (explosionRange - dist) / explosionRange
      const blastPower = force * 22 // Blast outward speed
      
      this.vx = (dx / dist) * blastPower + (Math.random() * 6 - 3)
      this.vy = (dy / dist) * blastPower + (Math.random() * 6 - 3)
      this.explosionTimer = 35 + Math.floor(Math.random() * 25) // Duration of free-fly blast
      this.recoveryEase = 0.0 // Start recovery ease at 0 so it pulls back very gently
    }
  }

  update(mx, my, isMouseActive, rotX, rotY) {
    if (this.explosionTimer > 0) {
      this.explosionTimer--
      // Bypasses regular gravity & anchor calculations during blast
      this.vx *= 0.94 // Friction slows down the explosion particles
      this.vy *= 0.94
      this.x += this.vx
      this.y += this.vy
      return
    }

    // Slowly increment recoveryEase back to 1.0
    if (this.recoveryEase < 1.0) {
      this.recoveryEase += 0.008
    }

    // Update 2D orbital anchor coordinates
    this.angle += this.angleSpeed
    const anchorX = this.originX + Math.cos(this.angle) * this.orbitRadius
    const anchorY = this.originY + Math.sin(this.angle) * this.orbitRadius

    let dx = mx - this.x
    let dy = my - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    
    let targetX = anchorX
    let targetY = anchorY
    let targetScale = 1
    let targetAlpha = 1
    let zDepth = 0

    const gravityRange = 250
    const isNearMouse = isMouseActive && dist < gravityRange

    if (isNearMouse) {
      // Calculate interpolation factor based on distance
      const gFactor = Math.min(1, Math.max(0, (gravityRange - dist) / gravityRange))
      const smoothFactor = gFactor * gFactor * (3 - 2 * gFactor) // Smooth easing curve

      // parametric coordinate calculations on unit 3D sphere
      const sinT = Math.sin(this.theta)
      const cosT = Math.cos(this.theta)
      const sinP = Math.sin(this.phi)
      const cosP = Math.cos(this.phi)

      const x3 = sinT * cosP
      const y3 = sinT * sinP
      const z3 = cosT

      // Rotate around Y-axis (rotY)
      const cosRY = Math.cos(rotY)
      const sinRY = Math.sin(rotY)
      const x3_ry = x3 * cosRY - z3 * sinRY
      const z3_ry = x3 * sinRY + z3 * cosRY

      // Rotate around X-axis (rotX)
      const cosRX = Math.cos(rotX)
      const sinRX = Math.sin(rotX)
      const y3_rx = y3 * cosRX - z3_ry * sinRX
      zDepth = y3 * sinRX + z3_ry * cosRX

      // 3D coordinates relative to mouse center
      const rx = x3_ry * this.sphereRadius
      const ry = y3_rx * this.sphereRadius

      const sphereTargetX = mx + rx
      const sphereTargetY = my + ry

      // Blend drifting 2D anchor and rotating 3D sphere target
      targetX = anchorX * (1 - smoothFactor) + sphereTargetX * smoothFactor
      targetY = anchorY * (1 - smoothFactor) + sphereTargetY * smoothFactor

      // 3D Depth projection: scale and fade based on depth (z-index equivalent)
      const relativeDepth = zDepth / this.sphereRadius // ranges -1 to 1
      targetScale = 1.0 + relativeDepth * 0.7 // Larger in front
      targetAlpha = 0.35 + (relativeDepth + 1) * 0.325 // Fader in back, brighter in front
    }

    // Smooth transition interpolations
    this.currentScale += (targetScale - this.currentScale) * 0.1
    this.currentAlpha += (targetAlpha - this.currentAlpha) * 0.1

    // Ease toward target coordinates, dampened by recoveryEase after explosions
    const activeEase = this.ease * this.recoveryEase
    this.vx += (targetX - this.x) * activeEase
    this.vy += (targetY - this.y) * activeEase

    // Constant tiny organic vibration
    this.vx += (Math.random() * 0.16 - 0.08)
    this.vy += (Math.random() * 0.16 - 0.08)

    this.vx *= this.friction
    this.vy *= this.friction
    this.x += this.vx
    this.y += this.vy
  }

  draw(ctx) {
    ctx.beginPath()
    const currentSize = this.size * this.currentScale
    
    // Blend alpha dynamically based on 3D depth
    const baseColor = this.color.includes('122') 
      ? `rgba(122, 255, 251, ${0.65 * this.currentAlpha})` 
      : `rgba(99, 102, 241, ${0.65 * this.currentAlpha})`

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 0.4) {
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5)
      ctx.strokeStyle = baseColor
      ctx.lineWidth = currentSize
      ctx.lineCap = 'round'
      ctx.stroke()
    } else {
      ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = baseColor
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
      // Add random jitter to break the rigid grid lines and make it look perfectly organic
      const originX = c * xSpacing + (Math.random() * spacing - spacing / 2)
      const originY = r * ySpacing + (Math.random() * spacing - spacing / 2)
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

const handleMouseDown = (e) => {
  const isMouseActive = mouseX.value !== -1000 && mouseY.value !== -1000
  if (isMouseActive) {
    particles.forEach(p => p.explode(e.clientX, e.clientY))
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mousedown', handleMouseDown)
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

      // Increment rotation speeds for 3D sphere rotation effect
      sphereRotationY += 0.008
      sphereRotationX += 0.005

      particles.forEach(p => {
        p.update(mouseX.value, mouseY.value, isMouseActive, sphereRotationX, sphereRotationY)
        p.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(loop)
    }
    loop()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mousedown', handleMouseDown)
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
