<script setup>
import { onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const store = useInventoryStore()

onMounted(() => {
  store.fetchItems()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-white p-8 w-full max-w-2xl">
      <h1 class="text-2xl font-bold mb-6">Inventory</h1>
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500 uppercase text-xs">
            <th class="pb-2 pr-4">Product name</th>
            <th class="pb-2 pr-4">SKU</th>
            <th class="pb-2 pr-4">Quantity</th>
            <th class="pb-2">Price (NOK)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in store.items"
            :key="item.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="py-2 pr-4 font-medium">{{ item.name }}</td>
            <td class="py-2 pr-4 text-gray-500">{{ item.sku }}</td>
            <td class="py-2 pr-4">{{ item.quantity }}</td>
            <td class="py-2">{{ item.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
