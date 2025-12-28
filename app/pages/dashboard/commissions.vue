<script setup lang="ts">
import { commissionsQuery } from '~/queries/commissions';
import { BackofficeCommissionAddSlideover } from '#components';

const tableSorting = ref([{ id: 'created_at', desc: true }]);
const tablePage = ref(1);
const { data:commissions, refetch:refetchCommissions, asyncStatus } = useQuery(commissionsQuery, () => ({
  sorting: {
    by: tableSorting.value[0]?.id || 'created_at',
    order: tableSorting.value[0]?.desc ? -1 : 1
  },
  page: tablePage.value
}));
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
      <div v-else-if="commissions && commissions.data.length">
        <BackofficeCommissionTable :commissions="commissions.data" v-model:sorting="tableSorting" />
      </div>
      <div v-else-if="commissions && !commissions.data.length">
        No commissions found!
      </div>
      <div v-if="commissions" class="flex justify-center">
        <UPagination
          v-model:page="tablePage"
          :items-per-page="50"
          :total="commissions.total"
        />
      </div>
    </div>
  </div>
</template>