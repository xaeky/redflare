<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { customersQuery } from '~/queries/customers';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  open: boolean,
  customer: Customer
}>();
const updatedCustomer = ref<Customer>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const editCustomerSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
const schema = customerOptionsSchema;
type Schema = z.output<typeof customerOptionsSchema>;
const state = reactive<Schema>({
  name: '',
  vrc_id: '',
  note: ''
});

// Watchers
watch(() => props.customer, (newCustomerData) => {
  updatedCustomer.value = newCustomerData;
  Object.assign(state, newCustomerData);
}, { immediate: true, deep: true });

// Mutations
const { mutate: updateCustomer, isLoading: updateCustomerBusy } = useMutation({
  mutation: () => useAPI(`/api/customers/${updatedCustomer.value?.id}`, {
    method: 'PATCH',
    body: _.mapValues(state, v => v?.trim() === '' ? null : v)
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries(customersQuery);
    editCustomerSlideoverOpen.value = false;
  }
});
</script>

<template>
  <USlideover v-model:open="editCustomerSlideoverOpen" title="Edit customer">
    <template #body>
      <div v-if="customer">
        <UForm :schema :state class="space-y-4" @submit="() => { updateCustomer() }">
          <UFormField name="id" label="ID" v-if="updatedCustomer">
            <UInput label="ID" v-model="updatedCustomer.id" class="w-full" readonly disabled aria-readonly="" />
          </UFormField>
          <UFormField name="name" label="Name">
            <UInput label="Name" v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField name="vrc_id" label="VRChat User ID">
            <UInput label="VRChat User ID" v-model="state.vrc_id" class="w-full" />
          </UFormField>
          <UFormField name="note" label="Note">
            <UInput label="Note" v-model="state.note" class="w-full" />
          </UFormField>
          <div>
            <UButton label="Save changes" type="submit" block :loading="updateCustomerBusy" :disabled="updateCustomerBusy" />
          </div>
        </UForm>
      </div>
      <div v-else>no customer data!</div>
    </template>
  </USlideover>
</template>