<script setup>
import { ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const inventory = useInventoryStore()

const name = ref('')
const sku = ref('')
const quantity = ref('')
const price = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  const q = Number.parseInt(String(quantity.value), 10)
  const p = Number.parseFloat(String(price.value).replace(',', '.'))
  if (!name.value.trim() || !sku.value.trim()) {
    errorMsg.value = 'Navn og varenummer er påkrevd.'
    return
  }
  if (!Number.isFinite(q) || q < 0) {
    errorMsg.value = 'Antall må være et tall som er null eller større.'
    return
  }
  if (!Number.isFinite(p) || p < 0) {
    errorMsg.value = 'Pris må være et tall som er null eller større.'
    return
  }

  submitting.value = true
  try {
    await inventory.createItem({
      name: name.value.trim(),
      sku: sku.value.trim(),
      quantity: q,
      price: p,
    })
    name.value = ''
    sku.value = ''
    quantity.value = ''
    price.value = ''
  } catch (e) {
    const detail = e.response?.data?.detail
    errorMsg.value =
      typeof detail === 'string' ? detail : 'Kunne ikke opprette produkt. Prøv igjen.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    class="border-b border-neas-mist bg-neas-white px-6 py-6 lg:px-8 dark:border-white/10 dark:bg-[#0f241d]"
  >
    <h3 class="text-xs font-medium uppercase tracking-[0.1em] text-neas-pine dark:text-[#e8f0ec]">
      Nytt produkt
    </h3>
    <p class="mt-1 text-sm font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60">
      Registrer et nytt lagerprodukt.
    </p>

    <div
      v-if="errorMsg"
      class="mt-4 rounded-xl border border-neas-pine/15 bg-neas-petal/35 px-4 py-3 text-sm font-normal leading-none text-neas-pine dark:border-neas-petal/30 dark:bg-neas-petal/20 dark:text-neas-petal"
      role="alert"
    >
      {{ errorMsg }}
    </div>

    <form class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" @submit.prevent="handleSubmit">
      <div class="sm:col-span-2 lg:col-span-1">
        <label
          for="item-name"
          class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
        >
          Produktnavn
        </label>
        <input
          id="item-name"
          v-model="name"
          type="text"
          autocomplete="off"
          class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
        />
      </div>
      <div>
        <label
          for="item-sku"
          class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
        >
          Varenummer
        </label>
        <input
          id="item-sku"
          v-model="sku"
          type="text"
          autocomplete="off"
          class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
        />
      </div>
      <div>
        <label
          for="item-qty"
          class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
        >
          Antall
        </label>
        <input
          id="item-qty"
          v-model="quantity"
          type="number"
          min="0"
          step="1"
          class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
        />
      </div>
      <div>
        <label
          for="item-price"
          class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80 dark:text-[#e8f0ec]/70"
        >
          Pris (NOK)
        </label>
        <input
          id="item-price"
          v-model="price"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
        />
      </div>
      <div class="flex items-end sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          :disabled="submitting"
          class="neas-button-dark rounded-[13px] px-6 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? 'Lagrer…' : 'Legg til produkt' }}
        </button>
      </div>
    </form>
  </div>
</template>
