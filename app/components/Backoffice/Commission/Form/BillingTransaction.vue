<script setup lang="ts">
import { ModalGenericConfirmation, BackofficeCommissionModalEditBillingTransaction } from '#components';
import type { DropdownMenuItem } from '@nuxt/ui';

const toast = useToast();
const overlay = useOverlay();
const clipboard = useClipboard();
const props = defineProps<{
  commission: string,
  transaction: Deserialized<PaymentTransaction>
}>();
const emit = defineEmits<{
  (e: 'deleted', id: string): void,
  (e: 'updated'): void
}>();

// Delete transaction log method
const billingTransactionDeleteBusy = ref(false);
const billingTransactionDeleteHandle = () => {
  if (!props.commission) return;
  async function tryDelete() {
    try {
      billingTransactionDeleteBusy.value = true;
      await useAPI(`/api/commissions/${props.commission}/billing/${props.transaction._id}`, {
        method: 'DELETE'
      });
      toast.add({
        title: 'Transaction deleted',
        description: 'The billing transaction has been deleted successfully.',
        color: 'success'
      });
      emit('deleted', props.transaction._id as unknown as string);
    } catch (error) {
      toast.add({
        title: 'Error deleting transaction',
        description: (error as Error).message,
        color: 'error'
      });
    }
  }
  const billingTransactionDeleteModal = overlay.create(ModalGenericConfirmation);
  billingTransactionDeleteModal.open({
    title: 'Remove payment transaction',
    message: 'Are you sure you want to remove this payment transaction? When a transaction has no associated commissions, it will be deleted from the database entirely.',
    confirmLabel: 'Remove',
    danger: true,
    onConfirm: tryDelete
  });
}

const transactionApprovedAt = computed(() => {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'medium', dateStyle: 'medium' }).format(new Date(props.transaction.approved_at));
});
const transactionLocales: Record<string, string> = {
  'USD': 'en-US',
  'ARS': 'es-AR'
}
const transactionFormattedProcessor = computed(() => {
  const processors: Record<string, string> = {
    'paypal': 'PayPal',
    'mercadopago': 'Mercado Pago'
  };
  return processors[props.transaction.payment_processor] || props.transaction.payment_processor;
})
const transactionLocale = computed(() => transactionLocales[props.transaction.payment_currency] || 'en-US');
const transactionAmounts = {
  billed: computed(() => {
    return new Intl.NumberFormat(transactionLocale.value, { style: 'currency', currency: props.transaction.payment_currency }).format(props.transaction.total_paid_amount);
  }),
  received: computed(() => {
    return new Intl.NumberFormat(transactionLocale.value, { style: 'currency', currency: props.transaction.payment_currency }).format(props.transaction.net_received_amount);
  })
}
const transactionDropdownItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Copy transaction ID',
      icon: 'i-heroicons-document-duplicate-20-solid',
      onSelect: async () => {
        try {
          await clipboard.copy(props.transaction._id as unknown as string);
          toast.add({
            title: 'Transaction ID has been copied to clipboard.',
            duration: 2000
          });
        } catch (error) {
          toast.add({
            title: 'Error copying transaction ID to clipboard.',
            color: 'error'
          });
        }
      }
    },
    {
      label: 'Edit transaction',
      icon: 'i-heroicons-pencil-16-solid',
      onSelect: () => {
        const editModal = overlay.create(BackofficeCommissionModalEditBillingTransaction, { destroyOnClose: true });
        editModal.open({
          commission: props.commission,
          transaction: props.transaction,
          onSubmitted: () => {
            editModal.close();
            emit('updated');
          }
        });
      }
    },
    {
      label: 'Remove transaction',
      icon: 'i-heroicons-trash-16-solid',
      color: 'error',
      onSelect: () => billingTransactionDeleteHandle()
    }
  ]
]);
</script>

<template>
  <div class="border border-neutral-800 rounded-lg p-4" :class="{ 'opacity-50': billingTransactionDeleteBusy }">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span v-text="transactionApprovedAt" class="text-sm" />
        <UDropdownMenu :items="transactionDropdownItems">
          <UButton icon="i-heroicons-ellipsis-vertical-20-solid" variant="subtle" color="neutral" />
        </UDropdownMenu>
      </div>
      <div v-if="transaction.internal_note" class="p-3 bg-muted rounded-md">
        <div class="text-sm text-muted mb-1">Internal note</div>
        <div class="text-sm" v-text="transaction.internal_note" />
      </div>
      <ul class="space-y-2">
        <li class="flex items-center justify-between">
          <span>Payment processor</span>
          <span v-text="transactionFormattedProcessor" />
        </li>
        <li class="flex items-center justify-between gap-8">
          <span>External payment ID</span>
          <span v-text="transaction.payment_ext_id" class="flex-1 font-mono truncate text-right" />
        </li>
      </ul>
      <div class="space-y-2">
        <div>Amount billed/net</div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-2xl font-bold">
            {{ transaction.payment_currency }} {{ transactionAmounts.billed }}
          </span>
          <span class="text-muted" v-text="transactionAmounts.received" />
        </div>
      </div>
    </div>
  </div>
</template>