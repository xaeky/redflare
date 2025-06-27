<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { customersQuery } from '~/queries/customers';
import { customerOptionsSchema } from '~/server/schemas/Customers';
import type { Customer } from '~/server/types/Customers';

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
const addCustomerSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
type Schema = z.output<typeof customerOptionsSchema>;
const state = reactive<Schema>({
  name: '',
  vrc_id: '',
  note: ''
});

// Mutations
const { mutate: addCustomer, isLoading: addCustomerBusy } = useMutation({
  mutation: () => useAPI(`/api/customers`, {
    method: 'POST',
    body: _.mapValues(state, v => v?.trim() === '' ? null : v)
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries(customersQuery);
    addCustomerSlideoverOpen.value = false;
  }
});
</script>

<template>
  <USlideover v-model:open="addCustomerSlideoverOpen" title="Add customer">
    <template #body>
      <UForm :schema="customerOptionsSchema" :state class="space-y-4" @submit="() => { addCustomer() }">
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
          <UButton label="Save changes" type="submit" block :loading="addCustomerBusy" :disabled="addCustomerBusy" />
        </div>
      </UForm>
    </template>
  </USlideover>
</template>