<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { customerFilterQuery } from '~/queries/customers';
import { CalendarDate } from '@internationalized/date';
import type { TabsItem, SelectItem } from '@nuxt/ui';
import { CommissionStatusType } from '~~/shared/enums/Commissions';

const toast = useToast();
const props = defineProps<{
  commission_id?: string
}>();
const remoteCommission = ref<WithCharacters<WithExistingCustomer<DeserializedCommission>> | null>(null);
const remoteCommissionBusy = ref<boolean>(true);

const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  customer: '',
  public_note: '',
  secure_note: '',
  status: CommissionStatusType.InSetup,
  characters: [],
  created_at: new Date()
});
const formTabs = ref<TabsItem[]>([ 
  { label: 'General', slot: 'general' as const }, 
  { label: 'Characters', slot: 'characters' as const }, 
  { label: 'Payments', slot: 'payments' as const }
]);
const formGeneralRef = ref();
const formCharactersRef = ref();

// External queries & computed props
// - Customer search query
const customerSearchQueryRaw = shallowRef<string>('');
const customerSearchQuery = refDebounced(customerSearchQueryRaw, 1000);
const customerSearchSelected = shallowRef<DeserializedCustomer>()
const { data:customers, isLoading: getCustomersBusy, refetch: customersRefetch } = useQuery(customerFilterQuery, () => ({
  name: customerSearchQuery.value || ''
}));
const availableCustomers = computed(() => {
  const localCustomer = remoteCommission.value ? remoteCommission.value.customer : null;
  const sanitizedLocalCustomer = localCustomer ? {
    label: localCustomer.name,
    value: localCustomer._id
  } : null;
  const sanitizedCustomers = [];
  if (remoteCommission) sanitizedCustomers.push(sanitizedLocalCustomer)
  if (customerSearchSelected.value) sanitizedCustomers.push({
    label: customerSearchSelected.value.name,
    value: customerSearchSelected.value._id
  });
  // Filters for remote customers
  const notLocalCustomer = (c: DeserializedCustomer) => localCustomer ? c._id !== localCustomer._id : true;
  const notSelectedCustomer = (c: DeserializedCustomer) => c._id !== customerSearchSelected.value?._id;
  if (customers.value) sanitizedCustomers.push(...customers.value.filter(c => notLocalCustomer(c) && notSelectedCustomer(c)).map(c => ({
    label: c.name,
    value: c._id,
    onSelect: () => {
      customerSearchSelected.value = c;
    }
  })));
  return sanitizedCustomers;
});
// - Commission status options
const commissionStatusOptions:SelectItem[] = [
  { type: 'label', label: 'Pending' },
  { label: 'In Project Setup', value: CommissionStatusType.InSetup, icon: 'i-lucide-circle-dashed' },
  { label: 'Backlog', value: CommissionStatusType.Backlog, icon: 'i-lucide-circle-question-mark' },
  { label: 'Missing', value: CommissionStatusType.Missing, icon: 'i-lucide-circle-alert' },
  { label: 'Next Up', value: CommissionStatusType.NextUp, icon: 'i-lucide-circle-ellipsis' },
  { type: 'separator' },
  { type: 'label', label: 'In progress' },
  { label: 'In Development', value: CommissionStatusType.InDevelopment, icon: 'i-lucide-circle-play' },
  { label: 'In Cooldown', value: CommissionStatusType.InCooldown, icon: 'i-lucide-circle-stop' },
  { type: 'separator' },
  { type: 'label', label: 'Complete' },
  { label: 'Showtime', value: CommissionStatusType.Showtime, icon: 'i-lucide-sparkles' },
  { label: 'Maintenance', value: CommissionStatusType.Maintenance, icon: 'i-lucide-hammer' },
  { label: 'Cancelled', value: CommissionStatusType.Cancelled, icon: 'i-lucide-circle-minus' },
  { label: 'Settled', value: CommissionStatusType.Settled, icon: 'i-lucide-circle-check-big' },
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
const commissionCharacters = computed(() => remoteCommission.value ? remoteCommission.value.characters : [])

// Watchers
watch(remoteCommission, (newCommissionData) => {
  if (!newCommissionData) return;
  const sanitizedData = _.cloneDeep(newCommissionData) as unknown as CommissionUpdate;
  sanitizedData.customer = newCommissionData.customer._id;
  sanitizedData.created_at = new Date(newCommissionData.created_at);
  customerSearchQueryRaw.value = newCommissionData.customer.name;
  // Assign the sanitized data to state, only existing fields with lodash
  _.assign(state, _.pick(sanitizedData, Object.keys(schema.shape)));
}, { immediate: true, deep: true });

watch(() => props.commission_id, async (newCommissionId) => {
  if (!newCommissionId) return;
  remoteCommissionBusy.value = true;
  try {
    const data = await useAPI<WithCharacters<WithExistingCustomer<DeserializedCommission>>>(`/api/commissions/${newCommissionId}`);
    remoteCommission.value = data;
  } catch (error) {
    toast.add({ title: 'Failed to load commission data.', color: 'error' });
  } finally {
    remoteCommissionBusy.value = false;
  }
}, { immediate: true });

async function validate() {
  // Do not report errors, next logic already does that
  try {
    await formGeneralRef.value?.validate();
    const characterForms = formCharactersRef.value?.forms;
    // @ts-expect-error // TODO: Fix type for formsCharacterRef
    await Promise.all(characterForms.map(async (f) => await f.validate()) || []);
  } catch (e) {}
  try {
    schema.parse(toRaw(state));
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.flatten().fieldErrors;
    }
    return { _form: ['An unknown error occurred.'] };
  }
}

export type BackofficeCommissionFormExposed = {
  state: Schema;
  validate: () => Record<string, string[] | null> | null;
}

defineExpose({
  state,
  validate
});
</script>

<template>
  <div v-if="(props.commission_id && !remoteCommissionBusy) || !props.commission_id" class="space-y-4">
    <UTabs variant="link" :items="formTabs" class="w-full" :ui="{ trigger: 'grow' }" :unmountOnHide="false">
      <template #general="{ item }">
        <UForm ref="formGeneralRef" :schema :state class="space-y-4">
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
        </UForm>
      </template>
      <template #characters="{ item }">
        <BackofficeCommissionFormCharacters ref="formCharactersRef" v-model:state="state" />
      </template>
      <template #payments="{ item }">
        Payments
      </template>
    </UTabs>
  </div>
  <div v-else class="space-y-4">
    <USkeleton class="w-full h-12" v-for="_ in new Array(4)" />
  </div>
</template>