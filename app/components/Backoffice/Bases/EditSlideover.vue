<script setup lang="ts">
const avatarBaseFormStore = useAvatarBaseFormStore();
</script>

<template>
  <USlideover title="Edit avatar base">
    <template #body>
      <BackofficeBasesForm />
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
          <UButton @click="() => { avatarBaseFormStore.update() }" :loading="avatarBaseFormStore.updateBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>