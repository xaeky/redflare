<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
}>(), {
  text: 'Loading...'
});
</script>

<template>
  <div class="inline-flex items-center gap-4">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-primary-500" />
    <span v-text="text" v-if="text" />
  </div>
</template>