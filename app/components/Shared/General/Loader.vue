<script setup lang="ts">
defineProps<{
  text?: string
}>();
</script>

<template>
  <div class="w-full flex items-center justify-center gap-4 p-4">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-primary-500" />
    <span v-text="text" v-if="text" />
  </div>
</template>