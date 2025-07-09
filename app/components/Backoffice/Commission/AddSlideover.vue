<script setup lang="ts">
// Props & vars
const props = defineProps<{
  open: boolean
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const addCommissionSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});
</script>

<template>
  <USlideover v-model:open="addCommissionSlideoverOpen" title="Add commission">
    <template #body>
      <BackofficeCommissionForm />
    </template>
  </USlideover>
</template>