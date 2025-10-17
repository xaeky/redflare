<script setup lang="ts">
import * as z from 'zod';
import type { WithId } from 'mongodb';

const toast = useToast();

const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
const state = defineModel<Schema>('state', {
  default: {}
});

const props = defineProps<{
  commission?: string
}>();

// Query remote commission's billing transactions
const { data: transactions, isLoading: transactionsLoading, error, refetch: transactionsRefresh } = useQuery<Deserialized<PaymentTransaction>[]>({
  key: () => ['commission-billing', props.commission as string],
  query: () => useAPI(`/api/commissions/${props.commission}/billing`),
  enabled: () => !!props.commission,
  refetchOnWindowFocus: false
});

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
      color: 'success'
    });
    transactionsRefresh();
  } catch (error) {
    toast.add({
      title: 'Error creating transaction',
      description: (error as Error).message,
      color: 'error'
    })
  }
  billingTransactionFormBusy.value = false;
}
const billingTransactionFormHide = ref(true);

const formsTransactionCreate = ref();
</script>

<template>
  <div class="space-y-4">
    <h1>Billing</h1>
    <div>
      <UButton color="neutral" variant="subtle" block @click="() => { billingTransactionFormHide = !billingTransactionFormHide }">
        {{ billingTransactionFormHide ? 'Show' : 'Hide' }} transaction form
      </UButton>
    </div>
    <div v-if="!billingTransactionFormHide" class="bg-muted p-4 rounded-lg">
      <h2>Create transaction</h2>
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
        <div>
          <UButton color="primary" type="submit" :loading="billingTransactionFormBusy" icon="i-lucide-plus">Create transaction</UButton>
        </div>
      </UForm>
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