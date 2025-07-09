<script setup lang="ts">
// Props & vars
const props = defineProps<{
  open: boolean,
  commission: SerializedCommission
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const editCommissionSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});
</script>

<template>
  <USlideover v-model:open="editCommissionSlideoverOpen" title="Edit commission">
    <template #body>
      <BackofficeCommissionForm :commission />
    </template>
  </USlideover>
</template>