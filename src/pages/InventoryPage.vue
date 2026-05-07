<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ItemTable from '@/components/ItemTable.vue'
import ItemForm from '@/components/ItemForm.vue'

const router = useRouter()
const store = useInventoryStore()
const auth = useAuthStore()
const { isDark } = storeToRefs(useThemeStore())
const { isAdmin, username } = storeToRefs(auth)

const logotypePine = '/neas-logos/Neas%20Logotype%20Pine%20Green.svg'
const logotypeWhite = '/neas-logos/Neas%20Logotype%20White.svg'
const logotypeSrc = computed(() => (isDark.value ? logotypeWhite : logotypePine))

onMounted(() => {
  store.fetchItems()
})

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-neas-mist text-neas-pine dark:bg-[#061512] dark:text-[#e8f0ec]"
  >
    <header
      class="border-b border-neas-pine/10 bg-neas-white px-[3.85vw] py-4 lg:py-5 dark:border-white/10 dark:bg-[#0c1f1a]"
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
          <ThemeToggle />
          <button
            type="button"
            class="rounded-xl border-2 border-neas-pine bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-neas-pine transition-[background-color,color] hover:bg-neas-pine hover:text-neas-white dark:border-[#e8f0ec] dark:text-[#e8f0ec] dark:hover:bg-[#e8f0ec] dark:hover:text-neas-pine"
            @click="logout"
          >
            Logg ut
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 px-[3.85vw] py-8 lg:py-10">
      <div
        class="mx-auto max-w-[1200px] overflow-hidden rounded-xl border border-neas-pine/8 bg-neas-white shadow-[0_1px_0_rgba(0,61,45,0.06)] dark:border-white/10 dark:bg-[#0f241d] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]"
      >
        <div
          class="border-b border-neas-mist bg-neas-mist/60 px-6 py-4 lg:px-8 dark:border-white/10 dark:bg-[#0a1814]"
        >
          <h2
            class="text-sm font-medium uppercase tracking-[0.08em] text-neas-pine dark:text-[#e8f0ec]"
          >
            Lager oversikt
          </h2>
          <p class="mt-1 text-sm font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60">
            Gjenstander i lageret ditt
          </p>
        </div>

        <ItemForm v-if="isAdmin" />
        <ItemTable :items="store.items" />
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
