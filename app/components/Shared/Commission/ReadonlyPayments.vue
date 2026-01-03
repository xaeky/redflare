<script setup lang="ts">
import type { OptionalId } from 'mongodb';

const props = defineProps<{
  payments: OptionalId<PaymentTransaction>[]
}>();

const formattedBilledAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formattedPaymentProcessor = (processor: string) => {
  const processorMap: Record<string, string> = {
    'mercadopago': 'Mercado Pago',
    'paypal': 'PayPal',
  };
  return processorMap[processor] || processor;
};

const formattedTimestamp = (timestamp: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
};
</script>

<template>
  <ul class="space-y-2">
    <li class="rf-shared-readonly-transaction-card" v-for="payment in payments" :key="(payment._id as unknown as string)">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-credit-card-16-solid" class="text-primary" />
          <span v-text="formattedPaymentProcessor(payment.payment_processor)" />
        </div>
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-clock-16-solid" class="text-primary" />
          <span v-text="formattedTimestamp(payment.approved_at)" />
        </div>
      </div>
      <div v-text="formattedBilledAmount(payment.total_paid_amount)" class="text-xl font-bold" />
    </li>
  </ul>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-shared-readonly-transaction-card {
  @apply bg-muted p-4 rounded-xl space-y-2 select-none;
}
</style>