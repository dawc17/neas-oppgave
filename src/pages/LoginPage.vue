<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  // try authstore.login, redirect on success, set error on fail
  try {
    await authStore.login(username.value, password.value)
    router.push('/inventory')
  } catch (e) {
    error.value = 'Invalid username or password'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-white p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6">login kurwa</h1>
      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
      <input
        v-model="username"
        type="text"
        placeholder="Username"
        class="w-full border px-3 py-2 mb-4"
      /><br />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full border px-3 py-2 mb-6"
      /><br />
      <button @click="handleLogin" class="w-full bg-blue-600 text-white py-2 hover:bg-blue-700">
        Login
      </button>
    </div>
  </div>
</template>
