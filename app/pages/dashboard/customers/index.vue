<script setup lang="ts">
import { customersQuery } from '~/queries/customers';
import { BackofficeCustomerAddSlideover } from '#components';

const toast = useToast();
const customerSorting = ref([{ id: 'created_at', desc: true }])
const { data:customers, refetch: refetchCustomers, asyncStatus, state } = useQuery(customersQuery, () => ({
  sorting: {
    by: customerSorting.value[0]?.id || 'created_at',
    order: customerSorting.value[0]?.desc ? -1 : 1
  }
}));

// Overlays
const overlay = useOverlay();
const addSlideoverOverlay = overlay.create(BackofficeCustomerAddSlideover);

watch(state, newState => {
  const isError = newState.status === 'error';
  if (isError) toast.add({
    color: 'error',
    title: 'Failed to fetch customers'
  });
});

watch(customerSorting, () => {
  refetchCustomers();
}, { immediate: true, deep: true });

definePageMeta({
  title: 'Customers',
  description: 'Manage your customers',
  actions: [
    {
      label: 'Refresh',
      icon: 'i-heroicons-arrow-path-16-solid',
      color: 'neutral',
      variant: 'subtle',
      action: () => { refetchCustomers(); }
    },
    {
      label: 'Add customer',
      icon: 'i-heroicons-plus-16-solid',
      action: () => { addSlideoverOverlay.open(); }
    }
  ],
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div v-if="asyncStatus === 'loading'" class="space-y-4">
    <USkeleton class="w-full h-12" v-for="_ in new Array(4)" />
  </div>
  <div v-else-if="customers && customers.length">
    <BackofficeCustomerTable :customers v-model:sorting="customerSorting" />
  </div>
  <div v-else-if="customers && !customers.length">
    No customers found!
  </div>
</template>