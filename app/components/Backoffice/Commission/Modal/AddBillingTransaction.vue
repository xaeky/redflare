<script setup lang="ts">
import * as z from 'zod';
const toast = useToast();

const props = defineProps<{
  commission?: string
}>();

const emit = defineEmits<{
  (e: 'created'): void
}>();

const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const billingTransactionSchema = commissionPaymentOptionsSchema;
const billingTransactionState = reactive<z.infer<typeof billingTransactionSchema>>({
  total_paid_amount: 0,
  net_received_amount: 0,
  payment_currency: 'USD',
  payment_processor: 'paypal',
  payment_ext_id: '',
  payment_ext_url: '',
  approved_at: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
  internal_note: ''
});
const billingForm = {
  paymentCurrencyOptions: [
    { label: 'USD', value: 'USD' },
    { label: 'ARS', value: 'ARS' },
  ],
  paymentProcessorOptions: [
    { label: 'PayPal', value: 'paypal' },
    { label: 'Mercado Pago', value: 'mercadopago' },
  ]
}
const billingTransactionFormBusy = ref(false);
const billingTransactionFormPostHandle = async () => {
  try {
    billingTransactionFormBusy.value = true;
    await useAPI(`/api/commissions/${props.commission}/billing`, {
      method: 'POST',
      body: billingTransactionState
    });
    toast.add({
      title: 'Transaction created',
      description: 'The billing transaction has been created successfully.',
    });
    emit('created');
  } catch (error) {
    toast.add({
      title: 'Error creating transaction',
      description: (error as any).data.message || (error as Error).message,
      color: 'error'
    })
  }
  billingTransactionFormBusy.value = false;
}
</script>

<template>
  <UModal title="Add billing transaction log" :dismissible="false">
    <template #body>
      <UForm ref="formsTransactionCreate" :schema="billingTransactionSchema" :state="billingTransactionState" @submit="billingTransactionFormPostHandle" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Total paid amount" name="total_paid_amount" required>
            <UInput type="number" v-model="billingTransactionState.total_paid_amount" />
          </UFormField>
          <UFormField label="Net received amount" name="net_received_amount" required>
            <UInput type="number" v-model="billingTransactionState.net_received_amount" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Payment currency" name="payment_currency" required>
            <USelect v-model="billingTransactionState.payment_currency" :items="billingForm.paymentCurrencyOptions" class="w-full" />
          </UFormField>
          <UFormField label="Payment processor" name="payment_processor" required>
            <USelect v-model="billingTransactionState.payment_processor" :items="billingForm.paymentProcessorOptions" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Payment external URL" name="payment_ext_url">
          <UInput v-model="billingTransactionState.payment_ext_url" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Payment external ID" name="payment_ext_id" required>
            <UInput v-model="billingTransactionState.payment_ext_id" class="w-full" />
          </UFormField>
          <UFormField label="Approved at" name="approved_at" required>
            <UInput type="datetime-local" v-model="billingTransactionState.approved_at" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Internal note" name="internal_note">
          <UInput v-model="billingTransactionState.internal_note" class="w-full" />
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