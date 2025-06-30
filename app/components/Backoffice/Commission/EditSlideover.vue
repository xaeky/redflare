<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionsQuery } from '~/queries/commissions';
import { customersQuery } from '~/queries/customers';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  open: boolean,
  commission: SerializedCommission
}>();
const updatedCommission = ref<CommissionUpdate>();

// External queries
// TODO: Use ref search query for customers + debounce
const { data:customers, isLoading: getCustomersBusy } = useQuery(customersQuery)

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const editCommissionSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  customer: '',
  public_note: '',
  secure_note: '',
  status: 'in_setup'
});

// Watchers
watch(() => props.commission, (newCommissionData) => {
  if (!newCommissionData) return;
  const sanitizedData = _.cloneDeep(newCommissionData) as unknown as CommissionUpdate;
  sanitizedData.customer = newCommissionData.customer.id;
  updatedCommission.value = sanitizedData;
  Object.assign(state, sanitizedData);
}, { immediate: true, deep: true });

// Mutations
const { mutate: updateCommission, isLoading: updateCommissionBusy } = useMutation({
  mutation: () => useAPI(`/api/customers/${props.commission.id}`, {
    method: 'PUT',
    body: _.mapValues(state, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries(commissionsQuery);
    editCommissionSlideoverOpen.value = false;
  }
});
</script>

<template>
  <USlideover v-model:open="editCommissionSlideoverOpen" title="Edit commission">
    <template #body>
      <div v-if="commission">
        <UForm :schema :state class="space-y-4" @submit="() => updateCommission()">
          <UFormField name="customer" label="Customer">
            <USelectMenu
              v-model="state.customer"
              :items="customers"
              labelKey="name"
              valueKey="id"
              :loading="getCustomersBusy"
              placeholder="Select a customer"
              class="w-full"
            />
          </UFormField>
          <div>
            <UButton label="Save changes" type="submit" block :loading="updateCommissionBusy" />
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>