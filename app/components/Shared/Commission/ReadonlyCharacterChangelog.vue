<script setup lang="ts">
defineProps<{
  changelog: CommissionCharacterChangelog[];
}>();
</script>

<template>
  <UModal title="Character changelog">
    <template #body>
      <div class="rf_shared_ro_character_changelog">
        <div v-for="(entry, index) in changelog" :key="index" class="changelog_entry">
          <div class="changelog_date">
            <span v-text="new Date(entry.date).toLocaleDateString()" />
          </div>
          <ul class="changelog_items">
            <li v-for="(item, itemIndex) in entry.items" :key="itemIndex">{{ item }}</li>
          </ul>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf_shared_ro_character_changelog {
  .changelog_entry { @apply space-y-2; }
  .changelog_date { @apply text-2xl font-bold text-primary; }
  .changelog_items { @apply list-disc pl-6 space-y-1; }
}

</style>
