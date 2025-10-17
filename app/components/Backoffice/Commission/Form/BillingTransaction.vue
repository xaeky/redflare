<script setup lang="ts">
import { ModalGenericConfirmation } from '#components';

const toast = useToast();
const overlay = useOverlay();
const props = defineProps<{
  commission: string,
  transaction: Deserialized<PaymentTransaction>
}>();
const emit = defineEmits<{
  (e: 'deleted', id: string): void
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
    title: 'Delete transaction',
    message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
    confirmLabel: 'Delete',
    danger: true,
    onConfirm: tryDelete
  });
}
</script>

<template>
  <div class="border border-neutral-800 rounded-lg p-4">
    <div>
      <ul class="space-y-2">
        <li class="flex items-center justify-between">
          <span>Created at</span>
          <span
            v-text="new Intl.DateTimeFormat('en-US', { timeStyle: 'medium', dateStyle: 'medium' }).format(new Date(transaction.created_at))"
          />
        </li>
        <li class="flex items-center justify-between">
          <span>Approved at</span>
          <span
            v-text="new Intl.DateTimeFormat('en-US', { timeStyle: 'medium', dateStyle: 'medium' }).format(new Date(transaction.approved_at))"
          />
        </li>
        <li class="flex items-center justify-between">
          <span>Processor and currency</span>
          <span>
            {{ transaction.payment_processor }} ({{ transaction.payment_currency }})
          </span>
        </li>
        <li class="flex items-center justify-between">
          <span>External payment ID</span>
          <span v-text="transaction.payment_ext_id" class="font-mono" />
        </li>
        <li class="flex items-center justify-between">
          <span>Amount billed</span>
          <span>
            {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.payment_currency }).format(transaction.total_paid_amount) }}
          </span>
        </li>
        <li class="flex items-center justify-between">
          <span>Amount received</span>
          <span>
            {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.payment_currency }).format(transaction.net_received_amount) }}
          </span>
        </li>
      </ul>
    </div>
    <div class="flex items-center justify-between mt-2">
      <UButton color="error" @click="billingTransactionDeleteHandle()" size="sm" :loading="billingTransactionDeleteBusy">Delete</UButton>
      <span v-text="transaction._id" class="font-mono text-sm" />
    </div>
  </div>
</template>