<script setup lang="ts">
type OverlayInstance = ReturnType<ReturnType<typeof useOverlay>['create']>;

const state = defineModel<CommissionCharacterChangelog[]>('changelogState', {
  required: true
});

const props = defineProps<{
  overlay: OverlayInstance
}>();

const handleAddVersion = () => {
  state.value.push({ date: new Date().toISOString(), version: '0.0.0', items: [''] });
};
const handleClose = () => props.overlay.close();
</script>

<template>
  <UModal title="Edit character release" :dismissible="false">
    <template #body>
      <div class="space-y-4" v-if="state.length">
        <BackofficeCommissionModalEditCharacterChangelogItem
          v-for="(changelogItem, index) in state" :key="index"
          v-model:changelogItemState="(state[index] as CommissionCharacterChangelog)"
          @remove="() => { state.splice(index, 1) }"
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
