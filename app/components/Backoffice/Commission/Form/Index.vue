<script setup lang="ts">
import type { TabsItem, SelectItem } from '@nuxt/ui';
import _ from 'lodash';
import * as z from 'zod';
import { customerFilterQuery } from '~/queries/customers';
import { CalendarDate } from '@internationalized/date';
import { CommissionStatusType } from '~~/shared/enums/Commissions';
import { useCommissionFormStore } from '~/stores/commissionForm';
const commissionFormStore = useCommissionFormStore();

const props = defineProps<{
  commission_id?: string
}>();

const formTabs = ref<TabsItem[]>([ 
  { label: 'General', slot: 'general' as const }, 
  { label: 'Characters', slot: 'characters' as const }, 
  { label: 'Billing', slot: 'billing' as const }
]);
const formGeneralRef = ref();
const formCharactersRef = ref();

// External queries & computed props
const customerSearchQueryRaw = shallowRef<string>('');
const customerSearchQuery = refDebounced(customerSearchQueryRaw, 1000);
const customerSearchSelected = shallowRef<DeserializedCustomer>()
const { data:customers, isLoading: getCustomersBusy } = useQuery(customerFilterQuery, () => ({
  name: customerSearchQuery.value || ''
}));
const availableCustomers = computed(() => {
  const hasCustomer = commissionFormStore.formState.customer && commissionFormStore.formState.customer.length > 0;
  const localCustomer = hasCustomer ? commissionFormStore.additionalState.customer : null;
  const sanitizedLocalCustomer = localCustomer ? {
    label: localCustomer.name,
    value: localCustomer._id
  } : null;
  let sanitizedCustomers = [];
  if (commissionFormStore.formState) sanitizedCustomers.push(sanitizedLocalCustomer)
  if (customerSearchSelected.value) sanitizedCustomers.push({
    label: customerSearchSelected.value.name,
    value: customerSearchSelected.value._id
  });
  // Filters for remote customers
  const notLocalCustomer = (c: DeserializedCustomer) => localCustomer ? c._id !== localCustomer._id?.toString() : true;
  const notSelectedCustomer = (c: DeserializedCustomer) => c._id !== customerSearchSelected.value?._id;
  if (customers.value) sanitizedCustomers.push(...customers.value.data.filter(c => notLocalCustomer(c) && notSelectedCustomer(c)).map(c => ({
    label: c.name,
    value: c._id,
    onSelect: () => {
      customerSearchSelected.value = c;
    }
  })));
  // Delete empty and null options
  sanitizedCustomers = sanitizedCustomers.filter(c => c !== null && c.value !== null);
  return sanitizedCustomers;
});

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
const commissionStatusOptionsIcon = computed(() => commissionStatusOptions.find(o => o.value === commissionFormStore.formState.status)?.icon);

const commissionCreatedDate = computed({
  get: () => {
    const date = commissionFormStore.formState.created_at instanceof Date ? commissionFormStore.formState.created_at : new Date();
    return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
  },
  set: (value: CalendarDate) => {
    const sanitizedCalendarDate = value.toDate('UTC');
    commissionFormStore.formState.created_at = sanitizedCalendarDate;
  }
});

// TODO: Refactor this to use it with current store.
async function validate() {
  // Do not report errors, validation already does that
  try {
    await formGeneralRef.value?.validate();
    const characterForms = formCharactersRef.value?.forms;
    // @ts-expect-error // TODO: Fix type for formsCharacterRef
    await Promise.all(characterForms.map(async (f) => await f.validate()) || []);
  } catch (e) {}
  try {
    commissionFormStore.schema.parse(toRaw(commissionFormStore.formState));
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.flatten().fieldErrors;
    }
    return { _form: ['An unknown error occurred.'] };
  }
}

watch(() => props.commission_id, (newId) => {
  if (typeof newId !== 'string') return commissionFormStore.reset();
  commissionFormStore.fetch(newId);
}, { immediate: true });

defineExpose({
  validate
});
</script>

<template>
  <div v-if="(props.commission_id && !commissionFormStore.busy) || !props.commission_id" class="space-y-4">
    <UTabs variant="link" :items="formTabs" class="w-full" :ui="{ trigger: 'grow' }" :unmountOnHide="false">
      <template #general>
        <UForm ref="formGeneralRef" :schema="commissionFormStore.schema" :state="commissionFormStore.formState" class="space-y-4">
          <UFormField name="customer" label="Customer">
            <USelectMenu
              v-model:model-value="commissionFormStore.formState.customer"
              v-model:search-term="customerSearchQueryRaw"
              :items="availableCustomers"
              valueKey="value"
              :loading="getCustomersBusy"
              placeholder="Select a customer"
              class="w-full"
            />
          </UFormField>
          <UFormField name="status" label="Status">
            <USelect v-model="commissionFormStore.formState.status" :items="commissionStatusOptions" :icon="commissionStatusOptionsIcon" class="w-full" />
          </UFormField>
          <UFormField name="created_at" label="Created at">
            <UCalendar v-model="commissionCreatedDate" />
          </UFormField>
          <UFormField name="public_note" label="Public Note">
            <UInput v-model="commissionFormStore.formState.public_note" class="w-full" />
          </UFormField>
          <UFormField name="secure_note" label="Private Note (only visible to you)">
            <UInput v-model="commissionFormStore.formState.secure_note" class="w-full" />
          </UFormField>
        </UForm>
      </template>
      <template #characters>
        <BackofficeCommissionFormCharacters ref="formCharactersRef" />
      </template>
      <template #billing>
        <BackofficeCommissionFormBilling v-if="props.commission_id" ref="formBillingRef" />
        <div v-else>
          <p class="text-sm text-gray-500 dark:text-gray-400">You can only manage billing transactions after creating the commission.</p>
        </div>
      </template>
    </UTabs>
  </div>
  <div v-else class="space-y-4">
    <USkeleton class="w-full h-12" v-for="_ in new Array(4)" />
  </div>
</template>