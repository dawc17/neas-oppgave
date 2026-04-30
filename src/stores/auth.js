import { defineStore } from 'pinia'
import client from '@/api/client'

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("jwtToken") || null,
  }),
  actions: {
    async login(username, password) {
      // call /auth/login, save token
      const response = await client.post("/auth/login", { username, password })
      this.token = response.data.token
      localStorage.setItem("jwtToken", this.token)
    },
    logout() {
      // clear token
      this.token = null
      localStorage.removeItem("jwtToken")
    }
  }
})
