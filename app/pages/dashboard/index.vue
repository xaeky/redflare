<script setup lang="ts">
import { statsQuery } from '~/queries/stats';

definePageMeta({
  title: 'Home',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});

const { data: stats, refetch: statsRefetch, isLoading: statsLoading } = useQuery(statsQuery);
const formatedStats = computed(() => {
  if (!stats.value) return [];
  return [
    { label: 'Today commissions', value: stats.value.commissions.today, type: 'int' },
    { label: 'This week commissions', value: stats.value.commissions.this_week, type: 'int' },
    { label: 'This month commissions', value: stats.value.commissions.this_month, type: 'int' },
    { label: 'This year commissions', value: stats.value.commissions.this_year, type: 'int' },
    { label: 'Today revenue (USD)', value: stats.value.net_revenue.usd.today, type: 'currency' },
    { label: 'This week revenue (USD)', value: stats.value.net_revenue.usd.this_week, type: 'currency' },
    { label: 'This month revenue (USD)', value: stats.value.net_revenue.usd.this_month, type: 'currency' },
    { label: 'This year revenue (USD)', value: stats.value.net_revenue.usd.this_year, type: 'currency' },
    { label: 'Today revenue (ARS)', value: stats.value.net_revenue.ars.today, type: 'currency' },
    { label: 'This week revenue (ARS)', value: stats.value.net_revenue.ars.this_week, type: 'currency' },
    { label: 'This month revenue (ARS)', value: stats.value.net_revenue.ars.this_month, type: 'currency' },
    { label: 'This year revenue (ARS)', value: stats.value.net_revenue.ars.this_year, type: 'currency' }
  ]
})

const session = useUserSession();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1>Welcome, {{ session.user.value?.nickname }}!</h1>
      <div v-if="!statsLoading">
        <UButton
          @click="() => { statsRefetch() }"
          label="Refresh stats" icon="i-lucide-refresh-cw"
        />
      </div>
    </div>
    <div v-if="!statsLoading" class="grid grid-cols-4 gap-8">
      <div v-for="(stat, statIdx) in formatedStats" :key="statIdx" class="flex flex-col gap-4 bg-muted border border-neutral-700/50 shadow-xl rounded-lg p-4">
        <span class="font-medium">{{ stat.label }}</span>
        <span class="text-2xl font-bold">{{ stat.type === 'currency' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stat.value) : stat.value }}</span>
      </div>
    </div>
    <div v-else>
      Loading stats...
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

h1 { @apply text-2xl font-bold; }
h2 { @apply text-xl font-bold }
</style>