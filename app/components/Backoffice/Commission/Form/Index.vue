<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionsQuery } from '~/queries/commissions';
import { customerFilterQuery } from '~/queries/customers';
import { CalendarDate } from '@internationalized/date';
import type { TabsItem, SelectItem } from '@nuxt/ui';
import { ModalGenericConfirmation } from '#components';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  commission?: SerializedCommission
}>();
const updatedCommission = ref<CommissionUpdate>();

// Form
const schema = commissionUpdateSchema;
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
  { label: 'Characters', disabled: !props.commission, slot: 'characters' as const }, 
  { label: 'Payments', disabled: !props.commission, slot: 'payments' as const }
]);
const closeOverlaysAndRefresh = () => {
  queryCache.invalidateQueries(commissionsQuery);
  useOverlay().closeAll();
  return;
};
const throwErrorToast = (text: string) => { useToast().add({ title: text, color: 'error' }) }

// External queries & computed props
// - Customer search query
const customerSearchQueryRaw = shallowRef<string>('');
const customerSearchQuery = refDebounced(customerSearchQueryRaw, 1000);
const customerSearchSelected = shallowRef<SerializedCommission['customer']>()
const { data:customers, isLoading: getCustomersBusy, refetch: customersRefetch } = useQuery(customerFilterQuery, () => ({
  name: customerSearchQuery.value || props.commission?.customer.name || ''
}));
const availableCustomers = computed(() => {
  const localCustomer = props.commission ? props.commission.customer : null;
  const sanitizedLocalCustomer = localCustomer ? {
    label: localCustomer.name,
    value: localCustomer.id
  } : null;
  const sanitizedCustomers = [];
  if (props.commission) sanitizedCustomers.push(sanitizedLocalCustomer)
  if (customerSearchSelected.value) sanitizedCustomers.push({
    label: customerSearchSelected.value.name,
    value: customerSearchSelected.value.id
  });
  // Filters for remote customers
  const notLocalCustomer = (c: SerializedCommission['customer']) => localCustomer ? c.id !== localCustomer.id : true;
  const notSelectedCustomer = (c: SerializedCommission['customer']) => c.id !== customerSearchSelected.value?.id;
  if (customers.value) sanitizedCustomers.push(...customers.value.filter(c => notLocalCustomer(c) && notSelectedCustomer(c)).map(c => ({
    label: c.name,
    value: c.id,
    onSelect: () => {
      customerSearchSelected.value = c;
    }
  })));
  return sanitizedCustomers;
});
// - Commission status options
const commissionStatusOptions:SelectItem[] = [
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
// @ts-expect-error @nuxt/ui should expose SelectItemBase!
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
});
// - Commission characters
const commissionCharacters = computed(() => props.commission && props.commission.characters ? props.commission.characters : [])

// Watchers
watch(() => props.commission, (newCommissionData) => {
  if (!newCommissionData) return;
  const sanitizedData = _.cloneDeep(newCommissionData) as unknown as CommissionUpdate;
  sanitizedData.customer = newCommissionData.customer.id;
  sanitizedData.created_at = new Date(newCommissionData.created_at);
  updatedCommission.value = sanitizedData;
  customerSearchQueryRaw.value = newCommissionData.customer.name;
  // Assign the sanitized data to state, only existing fields with lodash
  _.assign(state, _.pick(sanitizedData, Object.keys(schema.shape)));
}, { immediate: true, deep: true });


// Mutations
const { mutate: updateCommission, isLoading: updateCommissionBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions/${props.commission?.id}`, {
    method: 'PUT',
    body: _.mapValues(state, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  onSuccess: closeOverlaysAndRefresh,
  onError() { throwErrorToast('Failed to update commission.') }
});
const { mutate: addCommission, isLoading: addCommissionBusy } = useMutation({
  mutation: () => useAPI('/api/commissions', {
    method: 'POST',
    body: _.mapValues(state, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  onSuccess: closeOverlaysAndRefresh,
  onError() { throwErrorToast('Failed to add commission.') }
});
const operationCommissionBusy = computed(() => updateCommissionBusy.value || addCommissionBusy.value);
const { mutate: deleteCommission, isLoading: deleteCommissionBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions/${props.commission?.id}`, { method: 'DELETE' }),
  onSuccess: closeOverlaysAndRefresh,
  onError() { throwErrorToast('Failed to delete commission.') }
});

// Form methods
function formSubmitHandler() {
  if (props.commission) return updateCommission();
  return addCommission();
}
function formDeleteHandler() {
  useOverlay().create(ModalGenericConfirmation, {
    props: {
      title: 'Delete commission',
      onConfirm: deleteCommission
    }
  }).open();
}
</script>

<template>
  <div class="space-y-4">
    <UTabs variant="link" :items="formTabs" class="w-full" :ui="{ trigger: 'grow' }" :unmountOnHide="false">
      <template #general="{ item }">
        <UForm :schema :state class="space-y-4" @submit="formSubmitHandler">
          <UFormField name="id" label="ID" v-if="props.commission">
            <UInput label="ID" v-model="props.commission.id" class="w-full" readonly disabled aria-readonly="" />
          </UFormField>
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
          <UFormField name="public_note" label="Public Note">
            <UInput v-model="state.public_note" class="w-full" />
          </UFormField>
          <UFormField name="secure_note" label="Private Note (only visible to you)">
            <UInput v-model="state.secure_note" class="w-full" />
          </UFormField>
          <div class="space-y-4">
            <UButton label="Save changes" type="submit" block :loading="operationCommissionBusy" />
            <UButton v-if="props.commission" label="Delete" type="button" block color="error" @click="formDeleteHandler" />
          </div>
        </UForm>
      </template>
      <template #characters="{ item }">
        <BackofficeCommissionFormCharacters v-if="props.commission" :characters="commissionCharacters" :commission-id="props.commission.id" />
        <UAlert v-else description="You have to create the commission first to create characters." />
      </template>
      <template #payments="{ item }">
        Payments
      </template>
    </UTabs>
  </div>
</template>