<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { BackofficeBasesForm } from '#components'; 
const avatarBaseFormStore = useAvatarBaseFormStore();
const overlay = useOverlay();
const baseForm = ref<ComponentExposed<typeof BackofficeBasesForm>>();

async function handleSave() {
  await baseForm.value?.formRef?.validate({});
  avatarBaseFormStore.insert();
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

onMounted(avatarBaseFormStore.reset);
</script>

<template>
  <USlideover
    title="Add avatar base"
    :dismissible="!avatarBaseFormStore.isModified" @close:prevent="handleUpdateOpen"
  >
    <template #body>
      <BackofficeBasesForm ref="baseForm" />
    </template>
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <div class="flex w-full justify-end gap-2">
          <UButton
            @click="handleSave" label="Save" color="neutral" icon="i-lucide-save"
            :loading="avatarBaseFormStore.insertBusy" :disabled="!avatarBaseFormStore.isModified"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>