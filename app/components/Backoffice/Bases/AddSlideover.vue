<script setup lang="ts">
const avatarBaseFormStore = useAvatarBaseFormStore();
onMounted(avatarBaseFormStore.reset);
</script>

<template>
  <USlideover title="Add avatar base">
    <template #body>
      <BackofficeBasesForm />
    </template>
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <div class="flex w-full justify-end gap-2">
          <UButton @click="() => { avatarBaseFormStore.insert() }" :loading="avatarBaseFormStore.insertBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>