<script setup lang="ts">
const commissionFormStore = useCommissionFormStore();

async function handleSave() {
  commissionFormStore.insert();
}
</script>

<template>
  <USlideover title="Add commission">
    <template #body>
      <BackofficeCommissionForm ref="formRef" />
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton @click="handleSave" :loading="commissionFormStore.insertBusy">Save</UButton>
      </div>
    </template>
  </USlideover>
</template>