<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'

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
</script>

<template>
  <div class="relative min-h-screen flex flex-col lg:flex-row">
    <div class="absolute right-[1vw] top-4 z-10 lg:top-5">
      <ThemeToggle />
    </div>
    <div
      class="relative flex min-h-[42vh] flex-1 flex-col justify-end gap-4 bg-neas-pine p-[3.85vw] pb-12 pt-16 text-neas-white lg:min-h-screen lg:justify-between lg:pb-[3.85vw]"
    >
      <div
        class="pointer-events-none absolute right-[6%] top-[10%] w-[min(42vw,260px)] select-none opacity-[0.22]"
      >
        <img
          :src="symbolMoss"
          alt=""
          class="h-auto w-full object-contain"
          width="260"
          height="260"
        />
      </div>
      <div class="relative max-w-md">
        <img
          :src="logotypeWhite"
          alt="Neas"
          class="h-[clamp(1.75rem,4vw,2.25rem)] w-auto max-w-[min(100%,220px)] object-contain object-left"
          width="220"
          height="36"
        />
        <h1
          class="mt-5 text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neas-white"
        >
          Lagerstyring-system
        </h1>
        <p
          class="mt-4 max-w-sm text-[clamp(0.9375rem,1.6vw,1.125rem)] font-normal leading-none text-white/85"
        >
          Logg inn for å vise og administrere produkter.
        </p>
      </div>
      <p class="hidden text-xs text-white/40 lg:block">Proof of concept · Dawid Czaplicki</p>
    </div>

    <div
      class="flex flex-1 items-center justify-center bg-neas-mist p-[3.85vw] py-12 lg:py-[3.85vw] dark:bg-[#061512]"
    >
      <div
        class="w-full max-w-[420px] rounded-xl border border-neas-white bg-neas-white p-8 shadow-[0_1px_0_rgba(0,61,45,0.06)] lg:p-10 dark:border-white/10 dark:bg-[#0f241d] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]"
      >
        <h2
          class="text-xl font-medium leading-none tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
        >
          Logg inn
        </h2>
        <p class="mt-2 text-sm font-normal leading-none text-neas-pine/70 dark:text-[#e8f0ec]/65">
          Skriv inn ditt brukernavn og passord.
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
              class="box-border w-full rounded-xl border border-neas-mid-grey bg-neas-light-grey/50 px-4 py-3 text-base font-normal leading-none text-neas-pine outline-none transition-[border-color,box-shadow,background-color] placeholder:text-neas-pine/35 focus:border-neas-pine focus:bg-neas-white focus:ring-2 focus:ring-neas-moss/35 dark:border-white/15 dark:bg-[#061512] dark:text-[#e8f0ec] dark:placeholder:text-[#e8f0ec]/30 dark:focus:border-neas-moss dark:focus:bg-[#0a1814] dark:focus:ring-neas-moss/25"
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
              class="box-border w-full rounded-xl border border-neas-mid-grey bg-neas-light-grey/50 px-4 py-3 text-base font-normal leading-none text-neas-pine outline-none transition-[border-color,box-shadow,background-color] placeholder:text-neas-pine/35 focus:border-neas-pine focus:bg-neas-white focus:ring-2 focus:ring-neas-moss/35 dark:border-white/15 dark:bg-[#061512] dark:text-[#e8f0ec] dark:placeholder:text-[#e8f0ec]/30 dark:focus:border-neas-moss dark:focus:bg-[#0a1814] dark:focus:ring-neas-moss/25"
              placeholder=""
            />
          </div>
          <button
            type="submit"
            class="w-full rounded-xl bg-neas-pine py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-neas-white transition-[background-color,transform] hover:bg-[#002f24] active:scale-[0.99] dark:text-neas-white dark:hover:bg-[#004d3a]"
          >
            Logg inn
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
