<script setup lang="ts">
type OverlayInstance = ReturnType<ReturnType<typeof useOverlay>['create']>;

const state = defineModel<CommissionCharacterChangelog[]>('changelogState')

const props = defineProps<{
  overlay: OverlayInstance
}>();

function handleClose() {
  props.overlay.close();
}
</script>

<template>
  <UModal title="Edit character changelog" :dismissible="false">
    <template #body>
      <UForm :state class="space-y-4">
        <div v-for="(changelogEntry, index) in state" :key="index" class="space-y-2 p-4 bg-muted/50 rounded-lg shadow-md">
          <UFormField label="Date" name="date" :required="true">
            <UInput v-model="changelogEntry.date" class="w-full" />
          </UFormField>
          <div class="space-y-2">
            <span class="text-sm">Changes</span>
            <div v-for="(_item, itemIndex) in changelogEntry.items" :key="itemIndex" class="flex items-center gap-2">
              <UInput v-model="changelogEntry.items[itemIndex]" placeholder="Describe the change made..." class="w-full" />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="outline"
                size="sm"
                @click="changelogEntry.items.splice(itemIndex, 1)"
              />
            </div>
            <div class="flex justify-start" v-if="state">
              <UButton color="neutral" variant="soft" @click="changelogEntry.items.push('')" label="Add change" />
            </div>
          </div>
          <div v-if="state" class="flex justify-end">
            <UButton
              color="error"
              variant="soft"
              @click="state.splice(index, 1)"
              label="Remove version"
            />
          </div>
        </div>
        <div class="flex justify-end" v-if="state">
          <UButton @click="state.push({ date: new Date().toISOString(), items: [''] })" label="Add version" />
        </div>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton color="neutral" variant="subtle" @click="handleClose" label="Close" />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
