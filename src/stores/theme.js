import { defineStore } from 'pinia'

const KEY = 'neas-theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),
  actions: {
    initFromDocument() {
      this.isDark = document.documentElement.classList.contains('dark')
    },
    toggle() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
      localStorage.setItem(KEY, this.isDark ? 'dark' : 'light')
    },
  },
})
