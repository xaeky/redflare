<script setup lang="ts">
const { isLoggedIn, login, session } = usePublicUserSession();

definePageMeta({
  title: 'My Account'
});

const commissionsQueryOptions = defineQueryOptions({
  key: ['public', 'me', 'commissions'],
  query: () => useAPI<{ data: WithCustomer<DeserializedCommission>[], total: number }>('/api/public/me/commissions'),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined' && isLoggedIn.value
});

const {
  data: commissionsData,
  error: commissionsError,
  isLoading: commissionsLoading,
  isPending: commissionsPending,
  refetch: commissionsRefetch
} = useQuery(commissionsQueryOptions);

const handleCommissionCardClick = (commissionId: string) => {
  navigateTo(`/commission/${commissionId}`);
};
</script>

<template>
  <div class="h-full">
    <div v-if="!isLoggedIn" class="h-full">
      <div class="flex h-full items-center justify-center">
        <div class="bg-muted p-6 rounded-xl space-y-4 text-center border border-muted/50">
          <p>Please log in to access your customer account.</p>
          <div>
            <UButton label="Login with Discord" icon="i-ic-baseline-discord" @click="() => { login() }" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isLoggedIn && session" class="space-y-4">
      <PublicSessionCard size="sm" />
      <div class="space-y-2">
        <h1>My commissions</h1>
        <ul v-if="!commissionsLoading" class="grid grid-cols-2 gap-8">
          <li
            class="rf-public-commission-card"
            v-for="commission in commissionsData?.data" :key="commission._id"
            @click.stop="() => { handleCommissionCardClick(commission._id) }"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="font-mono uppercase text-lg" v-text="commission._id.substring(commission._id.length - 6)" />
              <SharedCommissionStatusBadge :status="commission.status" size="md" />
            </div>
            <div class="flex items-center gap-2">
              <UIcon class="text-primary" name="i-heroicons-calendar-16-solid" />
              {{ new Intl.DateTimeFormat('default', { dateStyle: 'long' }).format(new Date(commission.created_at)) }}
            </div>
          </li>
        </ul>
        <div v-else>
          <SharedGeneralLoader text="Loading commissions..." />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

h1 {
  @apply text-3xl font-bold;
}

.rf-public-commission-card {
  @apply bg-muted/50 p-6 rounded-xl space-y-4 cursor-pointer hover:shadow-lg hover:bg-muted/100 duration-200;
}
</style>