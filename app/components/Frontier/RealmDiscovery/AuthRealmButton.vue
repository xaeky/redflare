<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  icon?: string;
}>();
</script>

<template>
  <div class="realm-selection-option">
    <div class="text-left flex items-center gap-4">
      <div v-if="icon">
        <UIcon :name="icon" class="text-primary-400 w-6 h-6" />
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h3 v-text="title" />
          <UIcon class="realm-select-icon" name="i-lucide-arrow-right" />
        </div>
        <p class="text-muted text-sm" v-text="description" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.realm-selection-option {
  @apply space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-transparent hover:ring ring-inset ring-muted/50
  active:scale-95 duration-200 cursor-pointer;
  transition-timing-function: var(--ease-expo);
  h3 {
    @apply text-lg font-bold;
  }
  .realm-select-icon {
    @apply text-primary-400 opacity-0 -translate-x-2 duration-400 transition-transform;
    transition-timing-function: var(--ease-expo-smoothrelease);
  }
  &:hover .realm-select-icon {
    @apply translate-x-0 opacity-100;
  }
}
</style>