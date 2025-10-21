<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
const toast = useToast();

const props = defineProps<{
  commission?: string,
  transaction: Deserialized<PaymentTransaction>
}>();

const emit = defineEmits<{
  (e: 'submitted'): void
}>();

const billingTransactionSchema = commissionPaymentUpdateSchema;
const billingTransactionState = reactive<z.infer<typeof billingTransactionSchema>>({
  internal_note: ''
});
const billingTransactionFormBusy = ref(false);
const billingTransactionFormPostHandle = async () => {
  try {
    billingTransactionFormBusy.value = true;
    await useAPI(`/api/commissions/${props.commission}/billing/${props.transaction._id}`, {
      method: 'PATCH',
      body: billingTransactionState
    });
    toast.add({
      title: 'Transaction edited',
      description: 'The billing transaction has been edited successfully.',
    });
    emit('submitted');
  } catch (error) {
    toast.add({
      title: 'Error editing transaction',
      description: (error as any).data.message || (error as Error).message,
      color: 'error'
    })
  }
  billingTransactionFormBusy.value = false;
}

onMounted(() => {
  _.assign(billingTransactionState, _.pick(props.transaction, Object.keys(billingTransactionSchema.shape)));
});
</script>

<template>
  <UModal title="Edit billing transaction log" :dismissible="false">
    <template #body>
      <div class="space-y-4">
        <UAlert description="For security reasons, you can only edit some fields of payment transactions." variant="soft" color="neutral" icon="i-heroicons-lock-closed-20-solid" />
        <UForm ref="formsTransactionCreate" :schema="billingTransactionSchema" :state="billingTransactionState" @submit="billingTransactionFormPostHandle" class="space-y-4">
          <UFormField label="Internal note" name="internal_note">
            <UInput v-model="billingTransactionState.internal_note" class="w-full" />
          </UFormField>
        </UForm>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          @click="billingTransactionFormPostHandle" :loading="billingTransactionFormBusy"
          label="Submit" icon="i-heroicons-pencil-16-solid" />
      </div>
    </template>
  </UModal>
</template>