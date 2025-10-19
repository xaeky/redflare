<script setup lang="ts">
import { BackofficeCommissionModalAddBillingTransaction } from '#components';

const overlay = useOverlay();
const props = defineProps<{
  commission?: string
}>();

const openAddTransactionModal = () => {
  const modalOverlay = overlay.create(BackofficeCommissionModalAddBillingTransaction, {
    destroyOnClose: true
  });
  modalOverlay.open({
    commission: props.commission,
    onCreated: () => {
      transactionsRefresh();
      modalOverlay.close();
    }
  });
};

// Query remote commission's billing transactions
const { data: transactions, isLoading: transactionsLoading, error, refetch: transactionsRefresh } = useQuery<Deserialized<PaymentTransaction>[]>({
  key: () => ['commission-billing', props.commission as string],
  query: () => useAPI(`/api/commissions/${props.commission}/billing`),
  enabled: () => !!props.commission,
  refetchOnWindowFocus: false
});


</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1>Billing</h1>
      <div>
        <UButton
          @click="openAddTransactionModal"
          label="Add transaction log" icon="i-heroicons-plus-16-solid"
        />
      </div>
    </div>
    <div class="space-y-2">
      <h2>Transactions</h2>
      <div v-if="!transactionsLoading && transactions && transactions.length" class="space-y-4">
        <BackofficeCommissionFormBillingTransaction
          v-for="transaction in transactions" :key="transaction._id"
          :transaction :commission="(props.commission as string)"
          @deleted="() => { transactionsRefresh() }" />
      </div>
      <div v-else-if="transactionsLoading">
        <span>Loading transactions...</span>
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