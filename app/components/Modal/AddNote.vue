<script setup lang="ts">
import * as z from 'zod';
import { notesQuery } from '~/queries/notes';
import { noteOptionsSchema } from '~/server/schemas/Notes';

const queryCache = useQueryCache();

// Props
const props = defineProps<{
  open: boolean
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const addNoteModalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
type Schema = z.output<typeof noteOptionsSchema>;
const state = reactive<Schema>({
  content: ''
});

// Mutations
const { mutate: addNote, isLoading: addNoteBusy } = useMutation({
  mutation: () => useAPI('/api/notes', {
    method: 'POST',
    body: { content: state.content }
  }),
  async onSuccess() { 
    await queryCache.invalidateQueries(notesQuery);
    addNoteModalOpen.value = false;
    state.content = '';
  }
});

// Shortcuts
defineShortcuts({
  a: () => addNoteModalOpen.value = !addNoteModalOpen.value
});

</script>

<template>
  <UModal v-model:open="addNoteModalOpen" title="Add note">
    <template #body>
      <UForm :state :schema="noteOptionsSchema" @submit="() => { addNote() }" class="space-y-8">
        <UFormField label="Text" name="text">
          <UTextarea autoresize class="w-full" v-model="state.content"/>
        </UFormField>
        <UButton :disabled="addNoteBusy" label="Submit" type="submit"/>
      </UForm>
    </template>
  </UModal>
</template>