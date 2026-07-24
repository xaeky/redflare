<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { BackofficeBasesForm } from '#components'; 
const avatarBaseFormStore = useAvatarBaseFormStore();
onMounted(avatarBaseFormStore.reset);

const baseForm = ref<ComponentExposed<typeof BackofficeBasesForm>>();

async function handleSave() {
  try {
    await baseForm.value?.formRef?.validate({});
    avatarBaseFormStore.insert();
  } catch (error) {
    useToast().add({
      color: 'error',
      description: 'Please check the form for errors and try again.'
    });
  }
}
</script>

<template>
  <USlideover title="Add avatar base">
    <template #body>
      <BackofficeBasesForm ref="baseForm" />
    </template>
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <div class="flex w-full justify-end gap-2">
          <UButton @click="handleSave" :loading="avatarBaseFormStore.insertBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>