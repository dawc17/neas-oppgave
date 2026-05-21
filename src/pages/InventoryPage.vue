<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import ItemTable from '@/components/ItemTable.vue'
import ItemForm from '@/components/ItemForm.vue'

const router = useRouter()
const store = useInventoryStore()
const auth = useAuthStore()
const { isAdmin, username } = storeToRefs(auth)

const logotypePine = '/neas-logos/Neas%20Logotype%20Pine%20Green.svg'
const logotypeSrc = logotypePine

const pageEl = ref(null)
let rafId = 0

const isSelling = ref(false)
const saleSelections = ref({})
const saleStage = ref('select')
const receipt = ref(null)
const saleError = ref('')

function handlePointerMove(event) {
  if (!pageEl.value) return
  const { clientX, clientY } = event
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const rect = pageEl.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const offsetX = ((clientX - centerX) / rect.width) * 24
    const offsetY = ((clientY - centerY) / rect.height) * 24
    pageEl.value.style.setProperty('--neas-grid-x', `${offsetX.toFixed(2)}px`)
    pageEl.value.style.setProperty('--neas-grid-y', `${offsetY.toFixed(2)}px`)
  })
}

function handlePointerLeave() {
  if (!pageEl.value) return
  pageEl.value.style.setProperty('--neas-grid-x', '0px')
  pageEl.value.style.setProperty('--neas-grid-y', '0px')
}

const totalProducts = computed(() => store.items.length)
const totalUnits = computed(() =>
  store.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
)
const totalValue = computed(() =>
  store.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
)
const currency = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

onMounted(() => {
  store.fetchItems()
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
  if (rafId) cancelAnimationFrame(rafId)
})

function logout() {
  auth.logout()
  router.push('/login')
}

function openSale() {
  saleSelections.value = {}
  store.items.forEach((it) => (saleSelections.value[it.id] = 0))
  saleStage.value = 'select'
  receipt.value = null
  saleError.value = ''
  isSelling.value = true
  document.body.style.overflow = 'hidden'
}

function closeSale() {
  isSelling.value = false
  saleSelections.value = {}
  saleStage.value = 'select'
  receipt.value = null
  saleError.value = ''
  document.body.style.overflow = ''
}

function generateReceipt() {
  saleError.value = ''
  const lines = []
  let total = 0
  for (const it of store.items) {
    const q = Number(saleSelections.value[it.id] || 0)
    if (q > 0) {
      if (q > Number(it.quantity)) {
        saleError.value = `Antall for ${it.name} overstiger tilgjengelig beholdning.`
        return
      }
      const lineTotal = q * Number(it.price || 0)
      total += lineTotal
      lines.push({
        id: it.id,
        name: it.name,
        sku: it.sku,
        qty: q,
        price: Number(it.price || 0),
        lineTotal,
      })
    }
  }
  if (lines.length === 0) {
    saleError.value = 'Velg minst ett produkt og antall for å generere kvittering.'
    return
  }
  receipt.value = { lines, total }
  saleStage.value = 'preview'
}

async function confirmSale() {
  if (!receipt.value) return
  for (const line of receipt.value.lines) {
    const item = store.items.find((i) => i.id === line.id)
    if (!item) continue
    const newQty = Number(item.quantity) - Number(line.qty)
    if (newQty <= 0) {
      await store.deleteItem(item.id)
    } else {
      await store.updateItem(item.id, { ...item, quantity: newQty })
    }
  }
  closeSale()
}

function buildReceiptHtml(rcpt) {
  const date = new Date().toLocaleString('nb-NO')
  const linesHtml = rcpt.lines
    .map(
      (l) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${l.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${l.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(l.lineTotal)}</td>
        </tr>`,
    )
    .join('\n')

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Kvittering - ${date}</title>
    <style>
      body{font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:0; padding:24px; background:#f7f9f8; color:#08382f}
      .receipt{max-width:720px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.06)}
      .brand{color:#0a4d3c;font-weight:700;font-size:20px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      .footer{margin-top:20px;text-align:right;color:#375c4f}
    </style>
  </head>
  <body>
    <div class="receipt">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div class="brand">neas</div>
          <div style="font-size:12px;color:#4b6b63">Kvittering generert: ${date}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:600;color:#0a4d3c">Lager</div>
        </div>
      </div>
      <table role="presentation">
        <thead>
          <tr style="color:#386653;font-size:12px;text-transform:uppercase">
            <th style="text-align:left;padding:8px 12px">Produkt</th>
            <th style="text-align:center;padding:8px 12px">Antall</th>
            <th style="text-align:right;padding:8px 12px">Beløp</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
        </tbody>
      </table>
      <div class="footer">
        <div style="font-size:18px;font-weight:700">Totalt: ${new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(rcpt.total)}</div>
      </div>
    </div>
  </body>
  </html>`
  return html
}

function openReceiptHtml() {
  if (!receipt.value) return
  const html = buildReceiptHtml(receipt.value)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

async function downloadReceiptPng() {
  if (!receipt.value) return
  const html = buildReceiptHtml(receipt.value)
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const receiptEl = doc.querySelector('.receipt')
  if (!receiptEl) return

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '840px'
  container.style.zIndex = '99999'
  container.style.boxSizing = 'border-box'
  container.style.padding = '20px'
  container.style.background = '#ffffff'
  container.innerHTML = receiptEl.outerHTML
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    const now = new Date()
    const filename = `receipt-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (err) {
    console.error('Failed to render receipt to PNG', err)
  } finally {
    container.remove()
  }
}
</script>

<template>
  <div
    ref="pageEl"
    class="neas-page neas-grid flex min-h-screen flex-col text-neas-pine dark:text-[#e8f0ec]"
  >
    <header
      class="neas-glass border-b border-neas-pine/10 px-[3.85vw] py-4 backdrop-blur-lg lg:py-5"
    >
      <div class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="min-w-0">
            <img
              :src="logotypeSrc"
              alt="Neas"
              class="h-6 w-auto max-w-[140px] object-contain object-left sm:h-7 sm:max-w-[160px]"
              width="160"
              height="28"
            />
            <h1
              class="mt-1.5 text-lg font-medium leading-none tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
            >
              Lagerstyring-system
            </h1>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <p
            v-if="username"
            class="text-xs font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60"
          >
            Logget inn som
            <span class="font-medium text-neas-pine dark:text-[#e8f0ec]">{{ username }}</span>
          </p>
          <button type="button" class="neas-outline text-neas-pine" @click="logout">Logg ut</button>
        </div>
      </div>
    </header>

    <main class="flex-1 px-[3.85vw] py-8 lg:py-10">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-8">
        <section class="neas-hero neas-hero-animate px-6 py-8 lg:px-10 lg:py-10">
          <div
            class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div class="max-w-xl">
              <h2
                class="neas-reveal neas-delay-1 mt-4 text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em]"
              >
                Full kontroll over
                <span class="text-neas-sun">lageret</span>
              </h2>
              <p class="neas-reveal neas-delay-2 mt-4 max-w-lg text-sm text-white/80 lg:text-base">
                Se status i sanntid, legg til nye produkter og hold oversikt over total verdi.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button type="button" class="neas-button neas-reveal neas-delay-2" @click="openSale">
                Ny salg
              </button>
            </div>
          </div>
          <div class="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="neas-glass neas-kpi neas-reveal neas-delay-2 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Produkter
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ totalProducts }}
              </p>
            </div>
            <div class="neas-glass neas-kpi neas-reveal neas-delay-3 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Enheter
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ totalUnits }}
              </p>
            </div>
            <div class="neas-glass neas-kpi neas-reveal neas-delay-4 p-5">
              <p
                class="text-xs uppercase tracking-[0.16em] text-neas-pine/60 dark:text-[#e8f0ec]/60"
              >
                Total verdi
              </p>
              <p
                class="mt-3 text-3xl font-medium tracking-[-0.02em] text-neas-pine dark:text-[#e8f0ec]"
              >
                {{ currency.format(totalValue) }}
              </p>
            </div>
          </div>
          <img
            :src="logotypeSrc"
            alt="Neas"
            class="absolute right-6 top-6 h-5 w-auto opacity-80 lg:h-6"
            width="140"
            height="24"
          />
        </section>

        <section class="neas-panel neas-glass-strong neas-reveal neas-delay-3 overflow-hidden">
          <div
            class="border-b border-neas-mist bg-neas-mist/60 px-6 py-4 lg:px-8 dark:border-white/10 dark:bg-[#0a1814]"
          >
            <h2
              class="text-sm font-medium uppercase tracking-[0.08em] text-neas-pine dark:text-[#e8f0ec]"
            >
              Lageroversikt
            </h2>
            <p
              class="mt-1 text-sm font-normal leading-none text-neas-pine/65 dark:text-[#e8f0ec]/60"
            >
              Gjenstander i lageret ditt
            </p>
          </div>

          <ItemForm v-if="isAdmin" />
          <ItemTable :items="store.items" :is-admin="isAdmin" />
        </section>
      </div>
    </main>

    <Teleport to="body">
      <div
        v-if="isSelling"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div class="w-full max-w-[760px] rounded-2xl bg-neas-white p-6 shadow-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-neas-pine">Ny salg</h3>
            <button
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neas-pine/15 text-neas-pine"
              @click="closeSale"
            >
              ✕
            </button>
          </div>

          <div v-if="saleStage === 'select'" class="mt-4">
            <p class="text-sm text-neas-pine/70">Velg produkter og antall som selges.</p>
            <div class="mt-4 max-h-[48vh] overflow-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-xs text-neas-pine/70">
                    <th>Produkt</th>
                    <th>På lager</th>
                    <th>Pris</th>
                    <th>Selg</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in store.items"
                    :key="item.id"
                    class="border-t border-neas-mist py-2"
                  >
                    <td class="py-3 text-sm text-neas-pine">{{ item.name }}</td>
                    <td class="py-3 text-sm text-neas-pine">{{ item.quantity }}</td>
                    <td class="py-3 text-sm text-neas-pine">{{ item.price }}</td>
                    <td class="py-3">
                      <input
                        type="number"
                        min="0"
                        :max="item.quantity"
                        v-model.number="saleSelections[item.id]"
                        class="neas-input w-24"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex items-center justify-end gap-3">
              <p class="text-sm text-red-600 mr-auto" v-if="saleError">{{ saleError }}</p>
              <button class="neas-outline" @click="closeSale">Avbryt</button>
              <button class="neas-button" @click="generateReceipt">Forhåndsvis kvittering</button>
            </div>
          </div>

          <div v-else class="mt-4">
            <p class="text-sm text-neas-pine/70">Forhåndsvis kvittering</p>
            <div class="mt-4">
              <div
                v-for="line in receipt.lines"
                :key="line.id"
                class="flex justify-between p-5 border-b border-neas-mist"
              >
                <div>
                  <div class="text-sm font-medium text-neas-pine">{{ line.name }}</div>
                  <div class="text-xs text-neas-pine/60">{{ line.sku }} × {{ line.qty }}</div>
                </div>
                <div class="text-sm text-neas-pine">
                  {{
                    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                      line.lineTotal,
                    )
                  }}
                </div>
              </div>
              <div class="flex justify-between mt-4 pt-4 border-t border-neas-mist">
                <div class="text-sm text-neas-pine/70">Totalt</div>
                <div class="text-lg font-medium text-neas-pine">
                  {{
                    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                      receipt.total,
                    )
                  }}
                </div>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-3">
              <button class="neas-outline" @click="saleStage = 'select'">Tilbake</button>
              <button class="neas-outline" @click="openReceiptHtml">Åpne kvittering</button>
              <button class="neas-outline" @click="downloadReceiptPng">Last ned kvittering</button>
              <button class="neas-outline" @click="confirmSale">Bekreft salg</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
