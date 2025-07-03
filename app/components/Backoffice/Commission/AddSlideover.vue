<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionsQuery } from '~/queries/commissions';
import { customerFilterQuery } from '~/queries/customers';
import { CalendarDate } from '@internationalized/date';
import type { TabsItem } from '@nuxt/ui';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  open: boolean
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const addCommissionSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
const schema = commissionOptionsSchema;
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  customer: '',
  public_note: '',
  secure_note: '',
  status: 'in_setup',
  created_at: new Date()
});
const formTabs = ref<TabsItem[]>([ 
  { label: 'General', slot: 'general' as const }, 
  { label: 'Characters', slot: 'characters' as const }, 
  { label: 'Payments', slot: 'payments' as const }
]);

// External queries & computed props
// - Customer search query
const customerSearchQueryRaw = shallowRef<string>('');
const customerSearchQuery = refDebounced(customerSearchQueryRaw, 1000);
const customerSearchSelected = shallowRef<SerializedCommission['customer']>()
const { data:customers, isLoading: getCustomersBusy, refetch: customersRefetch } = useQuery(customerFilterQuery, () => ({
  name: customerSearchQuery.value || ''
}));
const availableCustomers = computed(() => {
  // TODO: Add type to this array.
  const sanitizedCustomers = [];
  if (customerSearchSelected.value) sanitizedCustomers.push({
    label: customerSearchSelected.value.name,
    value: customerSearchSelected.value.id
  });
  // Filters for remote customers
  const notSelectedCustomer = (c: SerializedCommission['customer']) => c.id !== customerSearchSelected.value?.id;
  if (customers.value) sanitizedCustomers.push(...customers.value.filter(c => notSelectedCustomer(c)).map(c => ({
    label: c.name,
    value: c.id,
    onSelect: () => {
      customerSearchSelected.value = c;
    }
  })));
  return sanitizedCustomers;
});
// - Commission status options
const commissionStatusOptions = [
  { type: 'label', label: 'Pending' },
  { label: 'In Project Setup', value: 'in_setup', icon: 'i-lucide-circle-dashed' },
  { label: 'Backlog', value: 'backlog', icon: 'i-lucide-circle-question-mark' },
  { label: 'Missing', value: 'missing', icon: 'i-lucide-circle-alert' },
  { label: 'Next Up', value: 'next_up', icon: 'i-lucide-circle-ellipsis' },
  { type: 'separator' },
  { type: 'label', label: 'In progress' },
  { label: 'In Development', value: 'in_development', icon: 'i-lucide-circle-play' },
  { label: 'In Cooldown', value: 'in_cooldown', icon: 'i-lucide-circle-stop' },
  { type: 'separator' },
  { type: 'label', label: 'Complete' },
  { label: 'Showtime', value: 'showtime', icon: 'i-lucide-sparkles' },
  { label: 'Maintenance', value: 'maintenance', icon: 'i-lucide-hammer' },
  { label: 'Cancelled', value: 'cancelled', icon: 'i-lucide-circle-minus' },
  { label: 'Settled', value: 'settled', icon: 'i-lucide-circle-check-big' },
];
const commissionStatusOptionsIcon = computed(() => commissionStatusOptions.find(o => o.value === state.status)?.icon);
// - Commission created date
const commissionCreatedDate = computed({
  get: () => {
    const date = state.created_at instanceof Date ? state.created_at : new Date();
    return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
  },
  set: (value: CalendarDate) => {
    const sanitizedCalendarDate = value.toDate('UTC');
    state.created_at = sanitizedCalendarDate;
  }
})

// Mutations
const { mutate: addCommission, isLoading: addCommissionBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions`, {
    method: 'POST',
    body: _.mapValues(state, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries(commissionsQuery);
    addCommissionSlideoverOpen.value = false;
  }
});
</script>

<template>
  <USlideover v-model:open="addCommissionSlideoverOpen" title="Add commission">
    <template #body>
      <div class="space-y-4">
        <UForm :schema :state class="space-y-4" @submit="() => addCommission()">
          <UFormField name="customer" label="Customer">
            <USelectMenu
              v-model:model-value="state.customer"
              v-model:search-term="customerSearchQueryRaw"
              :items="availableCustomers"
              valueKey="value"
              :loading="getCustomersBusy"
              placeholder="Select a customer"
              class="w-full"
            />
          </UFormField>
          <UFormField name="status" label="Status">
            <USelect v-model="state.status" :items="commissionStatusOptions" :icon="commissionStatusOptionsIcon" class="w-full" />
          </UFormField>
          <UFormField name="created_at" label="Created at">
            <UCalendar v-model="commissionCreatedDate" />
          </UFormField>
          <div>
            <UButton label="Add commission" type="submit" block :loading="addCommissionBusy" />
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>