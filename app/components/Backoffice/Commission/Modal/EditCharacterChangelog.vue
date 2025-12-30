<script setup lang="ts">
type OverlayInstance = ReturnType<ReturnType<typeof useOverlay>['create']>;
const commissionFormStore = useCommissionFormStore();

const props = defineProps<{
  characterIndex: number,
  overlay: OverlayInstance
}>();

const state = commissionFormStore.formState.characters[props.characterIndex]?.changelog;

const handleAddVersion = () => {
  state?.push({ date: new Date().toISOString(), version: '0.0.0', items: [''] });
};
const handleClose = () => props.overlay.close();
</script>

<template>
  <UModal title="Edit character release" :dismissible="false">
    <template #body>
      <div class="space-y-4" v-if="state?.length">
        <BackofficeCommissionModalEditCharacterChangelogItem
          v-for="(_changelogItem, changelogIndex) in state" :key="changelogIndex"
          :changelogIndex="changelogIndex" :characterIndex="characterIndex"
          @remove="() => { state?.splice(changelogIndex, 1) }"
        />
      </div>
      <div v-else class="text-center text-sm text-muted-foreground">
        No changelog versions added yet.
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <UButton @click="handleAddVersion" label="Add version" icon="i-lucide-plus" variant="soft" />
        <UButton color="neutral" variant="subtle" @click="handleClose" label="Close" />
      </div>
    </template>
  </UModal>
</template>
