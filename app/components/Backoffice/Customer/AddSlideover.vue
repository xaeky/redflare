<script setup lang="ts">
const customerFormStore = useCustomerFormStore();

onMounted(customerFormStore.reset);
</script>

<template>
  <USlideover title="Add customer">
    <template #body>
      <BackofficeCustomerForm />
    </template>
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <div class="flex w-full justify-end gap-2">
          <UButton
            @click="() => { customerFormStore.insert() }"
            :loading="customerFormStore.insertBusy"
            data-testid="add-customer-submit"
          >Save</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>