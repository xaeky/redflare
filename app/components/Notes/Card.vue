<script setup lang="ts">
import { notesQuery } from '~/queries/notes';

const toast = useToast();
const queryCache = useQueryCache();
const props = defineProps<{
  note: Note
}>();

const thisNote = props.note;

const { mutate: deleteNote, isLoading: deleteNoteBusy } = useMutation({
  mutation: () => useAPI(`/api/notes/${thisNote.id}`, { method: 'DELETE' }),
  onSuccess() {
    toast.add({ description: 'Note deleted!' });
    queryCache.invalidateQueries(notesQuery);
  }
})
</script>

<template>
  <div class="bg-neutral-800 p-4 rounded-xl" :class="{ 'opacity-50': deleteNoteBusy }">
    <div>
      <UButton
        icon="i-heroicons-trash-16-solid" @click="() => { deleteNote() }"
        variant="soft" :disabled="deleteNoteBusy"
      />
    </div>
    <p v-text="note.content" /> 
  </div>
</template>