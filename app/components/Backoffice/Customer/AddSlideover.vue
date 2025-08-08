<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';

const queryCache = useQueryCache();

// Form
const schema = customerOptionsSchema;
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
    await queryCache.invalidateQueries({ key: ['customers'] });
    useOverlay().closeAll();
  }
});
</script>

<template>
  <USlideover title="Add customer">
    <template #body>
      <UForm :schema :state class="space-y-4" @submit="() => { addCustomer() }">
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
          <UButton label="Add customer" type="submit" block :loading="addCustomerBusy" :disabled="addCustomerBusy" />
        </div>
      </UForm>
    </template>
  </USlideover>
</template>