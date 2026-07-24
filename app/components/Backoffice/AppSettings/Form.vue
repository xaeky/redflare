<script setup lang="ts">

</script>

<template>
  <div class="rf_settingsforms">
    <BackofficeAppSettingsFormGeneral />
    <BackofficeAppSettingsFormKnowledgeBase />
    <BackofficeAppSettingsFormEmail />
    <BackofficeAppSettingsFormLegal />
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf_settingsforms {
  @apply grid grid-cols-2 gap-4 items-start;
}
</style>