<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <div class="rf_settingsformbox">
    <div class="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-900/75">
      <UIcon :name="icon" class="w-6 h-6 text-primary" />
      <h2 class="flex-1" v-text="title" />
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div class="p-4 border-t border-neutral-100 dark:border-neutral-700" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf_settingsformbox {
  @apply border bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md border-neutral-100 dark:border-neutral-700 overflow-hidden;
  h2 { @apply text-xl font-semibold; }
}
</style>