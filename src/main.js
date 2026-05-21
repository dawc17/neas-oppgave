import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { client } from '@/lib/appwrite'

client.ping().then(
  () => {
    console.info('[Appwrite] Ping OK — invman (69fc8a12000382a60cd0)')
  },
  (err) => {
    console.warn('[Appwrite] Ping failed — check endpoint and project id', err)
  },
)

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
