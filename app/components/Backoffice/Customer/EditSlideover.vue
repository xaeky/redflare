<script setup lang="ts">
const customerFormStore = useCustomerFormStore();
</script>

<template>
  <USlideover title="Edit customer">
    <template #body>
      <BackofficeCustomerForm />
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center">
          <UButton
            icon="i-heroicons-trash-solid" color="error" variant="soft" :loading="customerFormStore.destroyBusy"
            @click="() => { customerFormStore.safeDestroy(customerFormStore.additionalState.id as string) }"
          />
        </div>
        <div class="flex w-full justify-end gap-2">
          <UButton @click="() => { customerFormStore.update() }" :loading="customerFormStore.updateBusy">Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>