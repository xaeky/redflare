<script setup lang="ts">
import _ from 'lodash';
import z from 'zod';
import { commissionsQuery } from '~/queries/commissions';
import type { BackofficeCommissionFormExposed } from '~/components/Backoffice/Commission/Form/Index.vue';

const toast = useToast();
const queryCache = useQueryCache();
const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
const formRef = ref<BackofficeCommissionFormExposed>();

const { mutate: addCommission, isLoading: addCommissionBusy } = useMutation({
  mutation: (upsertData: Schema) => useAPI('/api/commissions', {
    method: 'POST',
    body: _.mapValues(upsertData, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  onSuccess: () => {  
    queryCache.invalidateQueries(commissionsQuery);
    useOverlay().closeAll();
  },
  onError() { toast.add({ title: 'Failed to add commission.', color: 'error' }) }
});

function handleCancel() {
  useOverlay().closeAll();
}

async function handleSave() {
  if (!formRef.value) return;
  const errors = await formRef.value.validate();
  const insertData = toRaw(formRef.value.state);
  if (errors) {
    toast.add({ title: 'Unable to create an entry, review your fields!', color: 'error' });
    return;
  }
  addCommission(insertData);
}
</script>

<template>
  <USlideover title="Add commission">
    <template #body>
      <BackofficeCommissionForm ref="formRef" />
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton @click="handleCancel" color="neutral" variant="subtle" :disabled="addCommissionBusy">Cancel</UButton>
        <UButton @click="handleSave" :loading="addCommissionBusy">Save</UButton>
      </div>
    </template>
  </USlideover>
</template>