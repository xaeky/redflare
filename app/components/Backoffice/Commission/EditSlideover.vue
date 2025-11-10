<script setup lang="ts">
import _ from 'lodash';
import z from 'zod';
import { commissionsQuery } from '~/queries/commissions';
import type { BackofficeCommissionFormExposed } from '~/components/Backoffice/Commission/Form/Index.vue';
import { ModalGenericConfirmation } from '#components';

const props = defineProps<{
  commission_id: string
}>();

const toast = useToast();
const queryCache = useQueryCache();
const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
const formRef = ref<BackofficeCommissionFormExposed>();

// Overlays
const overlay = useOverlay();
const confirmationOverlay = overlay.create(ModalGenericConfirmation);

const { mutate: updateCommission, isLoading: updateCommissionBusy } = useMutation({
  mutation: (upsertData: Schema) => useAPI(`/api/commissions/${props.commission_id}`, {
    method: 'PUT',
    body: _.mapValues(upsertData, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
  }),
  onSuccess: () => {  
    queryCache.invalidateQueries(commissionsQuery);
    useOverlay().closeAll();
  },
  onError() { toast.add({ title: 'Failed to update commission.', color: 'error' }) }
});

const { mutate: deleteCommission, isLoading: deleteCommissionBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions/${props.commission_id}`, { method: 'DELETE' }),
  onSuccess() {
    queryCache.invalidateQueries(commissionsQuery);
    toast.add({ description: 'Commission deleted.' });
    useOverlay().closeAll();
  },
  onError() { toast.add({ title: 'Failed to delete commission.', color: 'error' }) }
});

function handleCancel() {
  useOverlay().closeAll();
}

async function handleSave() {
  if (!formRef.value) return;
  const errors = await formRef.value.validate();
  const upsertData = toRaw(formRef.value.state);
  if (errors) {
    toast.add({ title: 'Unable to save changes, review your fields!', color: 'error' });
    return;
  }
  updateCommission(upsertData);
}

function handleDelete() {
  confirmationOverlay.open({
    onConfirm: () => deleteCommission(),
    title: 'Delete commission'
  });
}
</script>

<template>
  <USlideover title="Edit commission">
    <template #body>
      <BackofficeCommissionForm ref="formRef" :commission_id />
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center">
          <UButton
            icon="i-heroicons-trash-solid"
            color="error"
            variant="soft"
            @click="handleDelete"
            :loading="deleteCommissionBusy"
          />
        </div>
        <div class="flex w-full justify-end gap-2">
          <UButton @click="handleCancel" color="neutral" variant="subtle" :disabled="updateCommissionBusy">Cancel</UButton>
          <UButton @click="handleSave" :loading="updateCommissionBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>