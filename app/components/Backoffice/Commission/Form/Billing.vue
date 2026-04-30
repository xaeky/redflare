<script setup lang="ts">
import { BackofficeCommissionModalAddBillingTransaction, BackofficeCommissionModalAddBillingExistingTransaction } from '#components';
import type { DropdownMenuItem } from '@nuxt/ui';

const overlay = useOverlay();
const commissionFormStore = useCommissionFormStore();

// Query remote commission's billing transactions
const { data: transactions, isLoading: transactionsLoading, error, refetch: transactionsRefresh } = useQuery<Deserialized<PaymentTransaction>[]>({
  key: () => ['commission-billing', commissionFormStore.additionalState.id],
  query: () => useAPI(`/api/commissions/${commissionFormStore.additionalState.id}/billing`),
  enabled: () => !!commissionFormStore.additionalState.id,
  refetchOnWindowFocus: false
});

const openAddTransactionModal = (existing?: boolean) => {
  const modalOverlay = overlay.create(existing ?
    BackofficeCommissionModalAddBillingExistingTransaction :
    BackofficeCommissionModalAddBillingTransaction, {
    destroyOnClose: true
  });
  modalOverlay.open({
    commission: commissionFormStore.additionalState.id as string,
    onCreated: () => {
      transactionsRefresh();
      modalOverlay.close();
    }
  });
};

const headerExtraActionsItems: DropdownMenuItem[][] = [
  [
    {
      label: 'Add existing transaction log',
      icon: 'i-heroicons-plus-16-solid',
      onSelect: () => openAddTransactionModal(true)
    }
  ]
];

</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1>Billing</h1>
      <div>
        <UFieldGroup>
          <UButton
            @click="() => openAddTransactionModal()" :loading="transactionsLoading"
            label="Add transaction log" icon="i-heroicons-plus-16-solid" color="neutral" variant="subtle"
          />
          <UDropdownMenu :items="headerExtraActionsItems">
            <UButton icon="i-heroicons-chevron-down-16-solid" color="neutral" variant="subtle" />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h2>Transactions</h2>
        <div>
          <UButton @click="() => { transactionsRefresh() }" label="Refresh" icon="i-lucide-refresh-cw" color="neutral" variant="soft" />
        </div>
      </div>
      <div v-if="!transactionsLoading && transactions && transactions.length" class="space-y-4">
        <BackofficeCommissionFormBillingTransaction
          v-for="transaction in transactions" :key="transaction._id"
          :transaction :commission="(commissionFormStore.additionalState.id as string)"
          @deleted="() => transactionsRefresh()"
          @updated="() => transactionsRefresh()"
        />
      </div>
      <div v-else-if="transactionsLoading">
        <SharedGeneralLoader text="Fetching transactions..." />
      </div>
      <div v-else>
        <span v-if="error">Error loading transactions: {{ error.message }}</span>
        <span v-else>No transactions found.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

h1 { @apply text-2xl font-bold; }
h2 { @apply text-xl font-bold; }
</style>