<script setup>
import { ref, onUnmounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

const inventory = useInventoryStore()

const isEditing = ref(false)
const editingItem = ref(null)
const formName = ref('')
const formSku = ref('')
const formQuantity = ref('')
const formPrice = ref('')
const editError = ref('')
const submitting = ref(false)

async function handleDelete(item) {
  if (!props.isAdmin) return
  await inventory.deleteItem(item.id)
}

function openEdit(item) {
  if (!props.isAdmin) return
  editingItem.value = item
  formName.value = item.name ?? ''
  formSku.value = item.sku ?? ''
  formQuantity.value = String(item.quantity ?? '')
  formPrice.value = String(item.price ?? '')
  editError.value = ''
  isEditing.value = true
  document.body.style.overflow = 'hidden'
}

function closeEdit() {
  isEditing.value = false
  editingItem.value = null
  document.body.style.overflow = ''
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

async function handleUpdate() {
  if (!props.isAdmin || !editingItem.value) return
  editError.value = ''
  const q = Number.parseInt(String(formQuantity.value), 10)
  const p = Number.parseFloat(String(formPrice.value).replace(',', '.'))
  if (!formName.value.trim() || !formSku.value.trim()) {
    editError.value = 'Navn og varenummer er paakrevd.'
    return
  }
  if (!Number.isFinite(q) || q < 0) {
    editError.value = 'Antall maa vaere et tall som er null eller storre.'
    return
  }
  if (!Number.isFinite(p) || p < 0) {
    editError.value = 'Pris maa vaere et tall som er null eller storre.'
    return
  }

  submitting.value = true
  try {
    await inventory.updateItem(editingItem.value.id, {
      name: formName.value.trim(),
      sku: formSku.value.trim(),
      quantity: q,
      price: p,
    })
    closeEdit()
  } catch (error) {
    const detail = error?.response?.data?.detail
    editError.value =
      typeof detail === 'string' ? detail : 'Kunne ikke oppdatere produktet. Prov igjen.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[640px] border-collapse text-left">
      <thead>
        <tr class="neas-table-head text-neas-white">
          <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] lg:px-8">
            Produktnavn
          </th>
          <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] lg:px-8">
            Varenummer
          </th>
          <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] lg:px-8">Antall</th>
          <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] lg:px-8">
            Pris (NOK)
          </th>
          <th
            v-if="isAdmin"
            class="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.14em] lg:px-8"
          >
            Handling
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="item.id"
          class="border-b border-neas-light-grey transition-colors hover:bg-neas-mid-grey/20 dark:border-white/10 dark:hover:bg-[#0a181477]"
          :class="
            index % 2 === 0
              ? 'bg-neas-white dark:bg-[#0f241d]'
              : 'bg-neas-mist/40 dark:bg-[#0a1814]'
          "
        >
          <td
            class="px-6 py-4 text-sm font-medium leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.name }}
          </td>
          <td
            class="px-6 py-4 text-sm font-normal leading-none text-neas-pine/70 lg:px-8 dark:text-[#e8f0ec]/65"
          >
            {{ item.sku }}
          </td>
          <td
            class="px-6 py-4 text-sm font-normal leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.quantity }}
          </td>
          <td
            class="px-6 py-4 text-sm font-normal leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.price }}
          </td>
          <td v-if="isAdmin" class="px-6 py-4 text-right lg:px-8">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neas-pine/15 text-neas-pine transition hover:border-neas-pine hover:bg-neas-pine/10"
                :aria-label="`Rediger ${item.name}`"
                @click="openEdit(item)"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neas-pine/15 text-neas-pine transition hover:border-neas-pine hover:bg-neas-pine/10"
                :aria-label="`Slett ${item.name}`"
                @click="handleDelete(item)"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td
            :colspan="isAdmin ? 5 : 4"
            class="px-6 py-16 text-center text-sm font-normal leading-none text-neas-pine/50 lg:px-8 dark:text-[#e8f0ec]/45"
          >
            Ingen produkter enda.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Teleport to="body">
    <div
      v-if="isAdmin && isEditing"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-item-title"
    >
      <div
        class="w-full max-w-[520px] rounded-2xl border border-neas-pine/15 bg-neas-white p-8 shadow-2xl"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-neas-pine/50">Rediger produkt</p>
            <h3 id="edit-item-title" class="mt-2 text-2xl font-medium text-neas-pine">
              Oppdater detaljer
            </h3>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neas-pine/15 text-neas-pine transition hover:border-neas-pine hover:bg-neas-pine/10"
            aria-label="Lukk"
            @click="closeEdit"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div
          v-if="editError"
          class="mt-4 rounded-xl border border-neas-pine/15 bg-neas-petal/35 px-4 py-3 text-sm font-normal text-neas-pine"
          role="alert"
        >
          {{ editError }}
        </div>

        <form class="mt-6 grid gap-4" @submit.prevent="handleUpdate">
          <div>
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80"
            >
              Produktnavn
            </label>
            <input
              v-model="formName"
              type="text"
              class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
            />
          </div>
          <div>
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80"
            >
              Varenummer
            </label>
            <input
              v-model="formSku"
              type="text"
              class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80"
              >
                Antall
              </label>
              <input
                v-model="formQuantity"
                type="number"
                min="0"
                step="1"
                class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
              />
            </div>
            <div>
              <label
                class="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-neas-pine/80"
              >
                Pris (NOK)
              </label>
              <input
                v-model="formPrice"
                type="text"
                inputmode="decimal"
                class="neas-input box-border w-full px-4 py-2.5 text-sm font-normal leading-none text-neas-pine"
              />
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button type="button" class="neas-outline text-neas-pine" @click="closeEdit">
              Avbryt
            </button>
            <button type="submit" class="neas-outline" :disabled="submitting">
              {{ submitting ? 'Lagrer…' : 'Lagre endringer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
