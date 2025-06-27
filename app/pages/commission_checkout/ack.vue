<script setup lang="ts">
import { get } from 'lodash';
import type { MPPayment } from '~/server/types/MercadoPago/General';

const route = useRoute();

const { data: paymentData, status: paymentFetching, error } = await useLazyAsyncData(
  'paymentData',
  () => $fetch(`/api/commissioner/checkoutResult?id=${route.query.payment_id}`),
  { default: () => ({}) }
);

const paymentStatus = computed(() => {
  if (paymentFetching.value === 'pending') return '';
  if (paymentFetching.value === 'error' || error.value) return 'FETCH_ERR';
  return 'SUCCESS';
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const operationTypeMap: Record<string, string> = {
  regular_payment: 'Pago regular',
  money_transfer: 'Transferencia'
};

type HumanizedProp = {
  path: keyof MPPayment | string;
  label: string;
  format?: (value: any) => string;
};

const paymentObjectHumanizedProps: HumanizedProp[] = [
  { path: 'id', label: 'ID de pago' },
  {
    path: 'operation_type',
    label: 'Tipo de operación',
    format: (value: string) => operationTypeMap[value] || value
  },
  {
    path: 'transaction_details.total_paid_amount',
    label: 'Monto total pagado',
    format: formatCurrency
  }
];

definePageMeta({
  middleware: 'guest-only'
});
</script>

<template>
  <div class="max-w-2xl mx-auto bg-stone-800 border border-stone-700/50 shadow-2xl shadow-stone-950/50 rounded-xl p-16">
    <div v-if="paymentFetching === 'pending'" class="space-x-6 text-center">
      <h2 class="text-2xl font-bold">Estamos procesando tu pago...</h2>
    </div>
    <div v-else>
      <div v-if="paymentStatus === 'SUCCESS'" class="flex flex-col items-center justify-center gap-4">
        <UIcon name="i-heroicons-check-circle" size="64" class="text-beige-200" />
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold">¡Recibimos tu pago!</h2>
          <p class="text-stone-300">Muchas gracias por confiar en nosotros, te acercamos los datos de esta transacción impulsada por MercadoPago.</p>
        </div>
        <ul class="flex flex-col w-full">
          <li v-for="(prop, propIndex) in paymentObjectHumanizedProps" :key="propIndex" class="flex items-center justify-between border-b border-stone-600/50 py-2">
            <span v-text="prop.label" class="text-stone-400" />
            <span v-text="typeof prop.format === 'function' ? prop.format(get(paymentData, prop.path) as string) : get(paymentData, prop.path)" class="font-bold" />
          </li>
        </ul>
      </div>
      <div v-else class="flex flex-col items-center justify-center gap-4">
        <UIcon name="i-heroicons-exclamation-triangle" size="64" class="text-error-400" />
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold">¡Oh! ¿Qué rompimos?</h2>
          <p class="text-stone-300">No pudimos procesar tu pago y este error ya fue reportado, intentalo nuevamente mas tarde. Si el problema persiste consulte con el artista/manager.</p>
        </div>
      </div>
    </div>
  </div>
</template>