<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { BackofficeBasesForm } from '#components';
import { USlideover } from '#components';
const avatarBaseFormStore = useAvatarBaseFormStore();
const overlay = useOverlay();
const baseForm = ref<ComponentExposed<typeof BackofficeBasesForm>>();

async function handleSave() {
  await baseForm.value?.formRef?.validate({});
  avatarBaseFormStore.update();
}

function handleUpdateOpen() {
  if (!avatarBaseFormStore.isModified) return;
  useConfirmationModal({
    title: 'Unsaved changes',
    message: 'You have unsaved changes. Are you sure you want to close this form?',
    confirmLabel: 'Discard changes',
    onConfirm: () => {
      avatarBaseFormStore.reset();
      overlay.closeAll();
    }
  });
}
</script>

<template>
  <USlideover
    title="Edit avatar base" 
    @close:prevent="handleUpdateOpen" :dismissible="!avatarBaseFormStore.isModified">
    <template #body>
      <BackofficeBasesForm ref="baseForm" />
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center">
          <UButton
            icon="i-heroicons-trash-solid" color="error" variant="soft" :loading="avatarBaseFormStore.destroyBusy"
            @click="() => { avatarBaseFormStore.safeDestroy(avatarBaseFormStore.additionalState.id as string) }"
          />
        </div>
        <div class="flex w-full justify-end gap-2">
          <UButton
            @click="handleSave" label="Save" color="neutral" icon="i-lucide-save"
            :loading="avatarBaseFormStore.updateBusy" :disabled="!avatarBaseFormStore.isModified"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>