<script setup lang="ts">
import { commissionsQuery } from '~/queries/commissions';
import { BackofficeCommissionAddSlideover } from '#components';

const { data:commissions, refetch:refetchCommissions, asyncStatus, state } = useQuery(commissionsQuery)

// Overlays
const overlay = useOverlay();
const addSlideoverOverlay = overlay.create(BackofficeCommissionAddSlideover);

const actions: PageAction[] = [
  {
    label: 'Refresh',
    icon: 'i-heroicons-arrow-path-16-solid',
    color: 'neutral',
    variant: 'subtle',
    action: () => refetchCommissions()
  },
  {
    label: 'New commission',
    icon: 'i-heroicons-plus-16-solid',
    action: () => { addSlideoverOverlay.open(); }
  }
];

definePageMeta({
  title: 'Commissions',
  description: 'Manage your commissions',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div class="space-y-4">
    <BackofficeHeaderActions :actions />
    <div>
      <div v-if="asyncStatus === 'loading'" class="space-y-4">
        <USkeleton class="w-full h-12" v-for="_ in new Array(4)" />
      </div>
      <div v-else-if="commissions && commissions.length">
        <BackofficeCommissionTable />
      </div>
      <div v-else-if="commissions && !commissions.length">
        No commissions found!
      </div>
    </div>
  </div>
</template>