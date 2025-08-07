<script setup lang="ts">
defineProps<{
  actions: PageAction[];
}>();
</script>

<template>
  <div class="rf_pageheader_actions">
    <div class="uppercase text-xs font-semibold text-neutral-500">
      <span>Actions</span>
    </div>
    <div class="flex items-center gap-4">
      <UButton
        v-for="(action, actionIndex) in actions"
        :key="actionIndex" :icon="action.icon" :color="action.color"
        :variant="action.variant" :label="action.label"
        @click="action.action"
      />
    </div>
  </div>
</template>

<style>
@reference '~/assets/global.css';

.rf_pageheader_actions {
  @apply flex items-center gap-2 bg-neutral-950/25 p-4 rounded-lg justify-between select-none;
}
</style>