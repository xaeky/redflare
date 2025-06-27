<script setup lang="ts">
// Props w/defaults
const props = withDefaults(defineProps<{
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmAdditional?: false | null | 'name'
  confirmAdditionalValue?: string;
  open: boolean
}>(), {
  title: 'Confirmation',
  message: 'Are you sure you want to perform this action?',
  confirmLabel: 'Continue'
});

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void,
  (e: 'confirm'): void
}>();

// Inputs
const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Actions
const actions = {
  cancel() { modalOpen.value = false; },
  confirm() { modalOpen.value = false; emit('confirm'); }
}
</script>

<template>
  <UModal :title v-model:open="modalOpen">
    <template #body>
      <p v-text="message" />
    </template>
    <template #footer>
      <div class="flex w-full items-center justify-end gap-4">
        <UButton label="Cancel" variant="subtle" color="neutral" @click="actions.cancel" />
        <UButton :label="confirmLabel" @click="actions.confirm" />
      </div>
    </template>
  </UModal>
</template>