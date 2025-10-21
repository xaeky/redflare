<script setup lang="ts">
import * as z from 'zod';
const toast = useToast();

const props = defineProps<{
  commission?: string
}>();

const emit = defineEmits<{
  (e: 'created'): void
}>();

const billingTransactionSchema = z.object({
  transactionId: z.string(),
});
const billingTransactionState = reactive<z.infer<typeof billingTransactionSchema>>({
  transactionId: ''
});
const billingTransactionFormBusy = ref(false);
const billingTransactionFormPostHandle = async () => {
  try {
    billingTransactionFormBusy.value = true;
    await useAPI(`/api/commissions/${props.commission}/billing`, {
      method: 'PUT',
      body: billingTransactionState
    });
    toast.add({
      title: 'Transaction added',
      description: 'The billing transaction has been added successfully.',
    });
    emit('created');
  } catch (error) {
    toast.add({
      title: 'Error adding transaction',
      description: (error as any).data.message || (error as Error).message,
      color: 'error'
    })
  }
  billingTransactionFormBusy.value = false;
}
</script>

<template>
  <UModal title="Add existing billing transaction log" :dismissible="false">
    <template #body>
      <UForm :schema="billingTransactionSchema" :state="billingTransactionState" @submit="billingTransactionFormPostHandle" class="space-y-4">
        <UFormField label="Transaction ID" name="transactionId">
          <UInput v-model="billingTransactionState.transactionId" class="w-full" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          @click="billingTransactionFormPostHandle" :loading="billingTransactionFormBusy"
          label="Add transaction log" icon="i-heroicons-plus-16-solid" />
      </div>
    </template>
  </UModal>
</template>