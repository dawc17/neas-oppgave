import { defineStore } from 'pinia'
import client from '@/api/client'

export const useInventoryStore = defineStore("inventory", {
  state: () => ({
    items: []
  }),
  actions: {
    async fetchItems() {
      const response = await client.get("/items")
      this.items = response.data
    },
    async createItem(data) {
      await client.post("/items", data)
      await this.fetchItems()
    },
    async updateItem(id, data) {
      await client.put(`/items/${id}`, data)
      await this.fetchItems()
    },
    async deleteItem(id) {
      await client.delete(`/items/${id}`)
      await this.fetchItems()
    }
  }
})
