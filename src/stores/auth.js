import { defineStore } from 'pinia'
import client from '@/api/client'

function payloadFromToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwtToken') || null,
  }),
  getters: {
    jwtPayload: (state) => payloadFromToken(state.token),
    role: (state) => payloadFromToken(state.token)?.role ?? null,
    username: (state) => payloadFromToken(state.token)?.username ?? null,
    isAdmin: (state) => payloadFromToken(state.token)?.role === 'admin',
  },
  actions: {
    async login(username, password) {
      const response = await client.post('/auth/login', { username, password })
      this.token = response.data.token
      localStorage.setItem('jwtToken', this.token)
    },
    async register(payload) {
      const response = await client.post('/auth/register', payload)
      this.token = response.data.token
      localStorage.setItem('jwtToken', this.token)
    },
    logout() {
      this.token = null
      localStorage.removeItem('jwtToken')
    },
  },
})
