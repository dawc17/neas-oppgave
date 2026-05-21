<script setup>
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const theme = useThemeStore()
const { isDark } = storeToRefs(theme)
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-neas-pine/20 bg-neas-white/90 text-neas-pine shadow-[0_10px_25px_rgba(0,61,45,0.12)] transition-[background-color,border-color,color,box-shadow] hover:border-neas-pine hover:bg-neas-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neas-moss dark:border-white/25 dark:bg-[#0f241d]/90 dark:text-neas-mist dark:shadow-[0_10px_25px_rgba(0,0,0,0.35)] dark:hover:border-neas-moss dark:hover:bg-[#143028]"
    :aria-pressed="isDark"
    :aria-label="isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'"
    @click="theme.toggle()"
  >
    <svg
      v-if="isDark"
      class="h-[1.125rem] w-[1.125rem]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>
    <svg
      v-else
      class="h-[1.125rem] w-[1.125rem]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  </button>
</template>
