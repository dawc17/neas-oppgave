<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[640px] border-collapse text-left">
      <thead>
        <tr class="bg-neas-pine text-neas-white dark:bg-neas-pine">
          <th class="px-6 py-3.5 text-xs font-medium uppercase tracking-[0.1em] lg:px-8">
            Produktnavn
          </th>
          <th class="px-6 py-3.5 text-xs font-medium uppercase tracking-[0.1em] lg:px-8">
            Varenummer
          </th>
          <th class="px-6 py-3.5 text-xs font-medium uppercase tracking-[0.1em] lg:px-8">Antall</th>
          <th class="px-6 py-3.5 text-xs font-medium uppercase tracking-[0.1em] lg:px-8">
            Pris (NOK)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="item.id"
          class="border-b hover:bg-neas-mid-grey/20 dark:hover:bg-[#0a181477] border-neas-light-grey transition-colors last:border-b-0 dark:border-white/10"
          :class="
            index % 2 === 0
              ? 'bg-neas-white dark:bg-[#0f241d]'
              : 'bg-neas-mist/40 dark:bg-[#0a1814]'
          "
        >
          <td
            class="px-6 py-3.5 text-sm font-medium leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.name }}
          </td>
          <td
            class="px-6 py-3.5 text-sm font-normal leading-none text-neas-pine/70 lg:px-8 dark:text-[#e8f0ec]/65"
          >
            {{ item.sku }}
          </td>
          <td
            class="px-6 py-3.5 text-sm font-normal leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.quantity }}
          </td>
          <td
            class="px-6 py-3.5 text-sm font-normal leading-none text-neas-pine lg:px-8 dark:text-[#e8f0ec]"
          >
            {{ item.price }}
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td
            colspan="4"
            class="px-6 py-16 text-center text-sm font-normal leading-none text-neas-pine/50 lg:px-8 dark:text-[#e8f0ec]/45"
          >
            Ingen produkter enda.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
