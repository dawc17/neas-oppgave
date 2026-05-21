<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push('/inventory')
  } catch {
    error.value = 'Invalid username or password'
  }
}

const symbolMoss = '/neas-symbols/Neas%20Symbol%20Moss%20Green.svg'
const logotypeWhite = '/neas-logos/Neas%20Logotype%20Sunlight%20Yellow.svg'

const pageEl = ref(null)
let rafId = 0

function handlePointerMove(event) {
  if (!pageEl.value) return
  const { clientX, clientY } = event
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const rect = pageEl.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const offsetX = ((clientX - centerX) / rect.width) * 24
    const offsetY = ((clientY - centerY) / rect.height) * 24
    pageEl.value.style.setProperty('--neas-grid-x', `${offsetX.toFixed(2)}px`)
    pageEl.value.style.setProperty('--neas-grid-y', `${offsetY.toFixed(2)}px`)
  })
}

function handlePointerLeave() {
  if (!pageEl.value) return
  pageEl.value.style.setProperty('--neas-grid-x', '0px')
  pageEl.value.style.setProperty('--neas-grid-y', '0px')
}

onMounted(() => {
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="pageEl" class="neas-page neas-grid relative min-h-screen flex flex-col lg:flex-row">
    <div
      class="neas-hero neas-hero-animate relative flex min-h-[45vh] flex-1 flex-col justify-between gap-6 rounded-l-none rounded-r-[24px] p-[3.85vw] pb-14 pt-16 text-neas-white lg:min-h-screen lg:pb-[3.85vw]"
    >
      <div
        class="neas-float pointer-events-none absolute right-[6%] top-[8%] w-[min(42vw,400px)] select-none opacity-[0.16]"
      >
        <img
          :src="symbolMoss"
          alt=""
          class="h-auto w-full object-contain"
          width="260"
          height="260"
        />
      </div>

      <div class="relative z-10 w-full mb-auto pb-4 lg:mb-0 lg:pb-0">
        <img
          :src="logotypeWhite"
          alt="Neas"
          class="neas-reveal h-[clamp(1.75rem,4vw,2.25rem)] w-auto max-w-[min(100%,220px)] object-contain object-left"
          width="220"
          height="36"
        />
      </div>

      <div class="relative max-w-md lg:mb-[6vh]">
        <h1
          class="neas-reveal neas-delay-2 text-[clamp(2.35rem,5vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-neas-white"
        >
          Oversikt som gjør beslutninger
          <span class="text-neas-sun">enklere.</span>
        </h1>
        <p
          class="neas-reveal neas-delay-3 mt-6 max-w-[340px] text-[clamp(0.95rem,1.6vw,1.1rem)] font-normal leading-relaxed text-white/85"
        >
          Logg inn og se lageret ditt i sanntid, med klare tall og tydelige prioriteringer.
        </p>
      </div>
    </div>

    <div class="flex flex-1 items-center justify-center p-[3.85vw] py-12 lg:py-[3.85vw]">
      <div
        class="neas-panel neas-glass-strong neas-reveal neas-delay-2 w-full max-w-[440px] p-8 lg:p-10"
      >
        <h2
          class="text-2xl font-medium leading-none tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
        >
          Logg inn
        </h2>
        <p
          class="mt-2 text-sm font-normal leading-relaxed text-neas-pine/70 dark:text-[#e8f0ec]/65"
        >
          Skriv inn brukernavn og passord for å fortsette.
        </p>

        <div
          v-if="error"
          class="mt-6 rounded-xl border border-neas-pine/15 bg-neas-petal/35 px-4 py-3 text-sm font-normal leading-none text-neas-pine dark:border-neas-petal/30 dark:bg-neas-petal/20 dark:text-neas-petal"
          role="alert"
        >
          {{ error }}
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          <div>
            <label
              for="login-user"
              class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
            >
              Brukernavn
            </label>
            <input
              id="login-user"
              v-model="username"
              type="text"
              autocomplete="username"
              class="neas-input box-border w-full px-4 py-3 text-base font-normal leading-none text-neas-pine placeholder:text-neas-pine/35"
              placeholder=""
            />
          </div>
          <div>
            <label
              for="login-pass"
              class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
            >
              Passord
            </label>
            <input
              id="login-pass"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="neas-input box-border w-full px-4 py-3 text-base font-normal leading-none text-neas-pine placeholder:text-neas-pine/35"
              placeholder=""
            />
          </div>
          <button type="submit" class="neas-button-dark rounded-[13px] w-full py-3.5 text-sm">
            Logg inn
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
