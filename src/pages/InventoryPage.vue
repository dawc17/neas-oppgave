<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import ItemTable from '@/components/ItemTable.vue'
import ItemForm from '@/components/ItemForm.vue'

const router = useRouter()
const store = useInventoryStore()
const auth = useAuthStore()
const { isAdmin, username } = storeToRefs(auth)

const logotypePine = '/neas-logos/Neas%20Logotype%20Pine%20Green.svg'
const logotypeSrc = logotypePine

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

const totalProducts = computed(() => store.items.length)
const totalUnits = computed(() =>
  store.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
)
const totalValue = computed(() =>
  store.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
)
const currency = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

onMounted(() => {
  store.fetchItems()
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
  if (rafId) cancelAnimationFrame(rafId)
})

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div
    ref="pageEl"
    class="neas-page neas-grid flex min-h-screen flex-col text-neas-pine dark:text-[#e8f0ec]"
  >
    <header
      class="border-b border-neas-pine/10 bg-neas-white/90 px-[3.85vw] py-4 backdrop-blur-lg lg:py-5 dark:border-white/10 dark:bg-[#0c1f1a]/80"
    >
      <div class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="min-w-0">
            <img
              :src="logotypeSrc"
              alt="Neas"
              class="h-6 w-auto max-w-[140px] object-contain object-left sm:h-7 sm:max-w-[160px]"
              width="160"
              height="28"
            />
            <h1
              class="mt-1.5 text-lg font-medium leading-none tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
            >
              Lagerstyring-system
            </h1>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <p
            v-if="username"
            class="text-xs font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60"
          >
            Logget inn som
            <span class="font-medium text-neas-pine dark:text-[#e8f0ec]">{{ username }}</span>
          </p>
          <button type="button" class="neas-outline text-neas-pine" @click="logout">Logg ut</button>
        </div>
      </div>
    </header>

    <main class="flex-1 px-[3.85vw] py-8 lg:py-10">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-8">
        <section class="neas-hero neas-hero-animate px-6 py-8 lg:px-10 lg:py-10">
          <div
            class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div class="max-w-xl">
              <h2
                class="neas-reveal neas-delay-1 mt-4 text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em]"
              >
                Full kontroll over
                <span class="text-neas-sun">lageret</span>
              </h2>
              <p class="neas-reveal neas-delay-2 mt-4 max-w-lg text-sm text-white/80 lg:text-base">
                Se status i sanntid, legg til nye produkter og hold oversikt over total verdi.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button type="button" class="neas-button neas-reveal neas-delay-2">
                Eksporter rapport
              </button>
              <button type="button" class="neas-outline neas-reveal neas-delay-3 text-white">
                Inviter team
              </button>
            </div>
          </div>
          <div class="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="neas-kpi neas-reveal neas-delay-2 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Produkter
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ totalProducts }}
              </p>
            </div>
            <div class="neas-kpi neas-reveal neas-delay-3 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Enheter
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ totalUnits }}
              </p>
            </div>
            <div class="neas-kpi neas-reveal neas-delay-4 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Total verdi
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ currency.format(totalValue) }}
              </p>
            </div>
          </div>
          <img
            :src="logotypeSrc"
            alt="Neas"
            class="absolute right-6 top-6 h-5 w-auto opacity-80 lg:h-6"
            width="140"
            height="24"
          />
        </section>

        <section class="neas-panel neas-reveal neas-delay-3 overflow-hidden">
          <div
            class="border-b border-neas-mist bg-neas-mist/60 px-6 py-4 lg:px-8 dark:border-white/10 dark:bg-[#0a1814]"
          >
            <h2
              class="text-sm font-medium uppercase tracking-[0.08em] text-neas-pine dark:text-[#e8f0ec]"
            >
              Lageroversikt
            </h2>
            <p
              class="mt-1 text-sm font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60"
            >
              Gjenstander i lageret ditt
            </p>
          </div>

          <ItemForm v-if="isAdmin" />
          <ItemTable :items="store.items" />
        </section>
      </div>
    </main>

    <footer class="mt-auto border-t border-neas-pine/10 px-[3.85vw] py-6 dark:border-white/10">
      <p
        class="mx-auto max-w-[1200px] text-center text-xs font-normal leading-none text-neas-pine/40 dark:text-[#e8f0ec]/35"
      >
        Proof of concept · Dawid Czaplicki
      </p>
    </footer>
  </div>
</template>
