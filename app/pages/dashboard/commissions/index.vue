<script setup lang="ts">
import { commissionsQuery } from '~/queries/commissions';

const toast = useToast();
const { data:commissions, refetch:refetchCommissions, asyncStatus, state } = useQuery(commissionsQuery)
const addSlideoverOpen = ref(false);

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div id="xarf_dash_commissions" class="space-y-8">
    <div class="flex items-center justify-between">
      <Hx level="1">Commissions</Hx>
      <div class="space-x-4">
        <UButton
          label="Refresh" icon="i-heroicons-arrow-path-16-solid"
          color="neutral" variant="subtle"
          @click="() => { refetchCommissions() }"
        />
        <UButton
          label="New commission" icon="i-heroicons-plus-16-solid"
          @click="() => { addSlideoverOpen = true; }"
        />
      </div>
    </div>
    <div>
      <div v-if="asyncStatus === 'loading'" class="space-y-4">
        <USkeleton class="w-full h-12" v-for="_ in new Array(4)" />
      </div>
      <div v-else-if="commissions && commissions.length">
        <BackofficeCommissionTable :commissions />
      </div>
      <div v-else-if="commissions && !commissions.length">
        No commissions found!
      </div>
    </div>
    <BackofficeCommissionAddSlideover
      v-model:open="addSlideoverOpen"
    />
  </div>
</template>