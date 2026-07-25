<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { BackofficeBasesForm } from '#components'; 
const avatarBaseFormStore = useAvatarBaseFormStore();

const baseForm = ref<ComponentExposed<typeof BackofficeBasesForm>>();

async function handleSave() {
  try {
    await baseForm.value?.formRef?.validate({});
    avatarBaseFormStore.update();
  } catch (error) {
    useToast().add({
      color: 'error',
      description: 'Please check the form for errors and try again.'
    });
  }
}
</script>

<template>
  <USlideover title="Edit avatar base">
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
          <UButton @click="handleSave" :loading="avatarBaseFormStore.updateBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>