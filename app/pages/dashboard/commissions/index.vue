<script setup lang="ts">
import { commissionsQuery } from '~/queries/commissions';

const toast = useToast();
const { data:commissions, refetch:refetchCommissions, asyncStatus, state } = useQuery(commissionsQuery)

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div id="xarf_dash_commissions" class="space-y-8">
    <div>
      <Hx level="1">Commissions</Hx>
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
  </div>
</template>