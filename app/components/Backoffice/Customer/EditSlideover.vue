<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';

const queryCache = useQueryCache();
const props = defineProps<{
  customer: DeserializedCustomer
}>();
const updatedCustomer = ref<DeserializedCustomer>();

// Form
const schema = customerOptionsSchema;
type Schema = z.output<typeof customerOptionsSchema>;
const state = reactive<Schema>({
  name: '',
  vrc_id: '',
  note: '',
  telegram_id: '',
  discord_id: ''
});

// Watchers
watch(() => props.customer, (newCustomerData) => {
  updatedCustomer.value = newCustomerData;
  Object.assign(state, newCustomerData);
}, { immediate: true, deep: true });

// Mutations
const { mutate: updateCustomer, isLoading: updateCustomerBusy } = useMutation({
  mutation: () => useAPI(`/api/customers/${updatedCustomer.value?._id}`, {
    method: 'PUT',
    body: _.mapValues(state, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries({ key: ['customers'] });
    useOverlay().closeAll();
  }
});
</script>

<template>
  <USlideover title="Edit customer">
    <template #body>
      <div v-if="customer">
        <UForm :schema :state class="space-y-4" @submit="() => updateCustomer()">
          <UFormField name="name" label="Name" required>
            <UInput label="Name" v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField name="vrc_id" label="VRChat User ID">
            <UInput label="VRChat User ID" v-model="state.vrc_id" class="w-full" />
          </UFormField>
          <UFormField name="telegram_id" label="Telegram ID">
            <UInput label="Telegram ID" v-model="state.telegram_id" class="w-full" />
          </UFormField>
          <UFormField name="discord_id" label="Discord ID">
            <UInput label="Discord ID" v-model="state.discord_id" class="w-full" />
          </UFormField>
          <UFormField name="note" label="Note">
            <UInput label="Note" v-model="state.note" class="w-full" />
          </UFormField>
          <div>
            <UButton label="Save changes" type="submit" block :loading="updateCustomerBusy" :disabled="updateCustomerBusy"/>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>