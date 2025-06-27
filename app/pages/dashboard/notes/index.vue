<script setup lang="ts">
import { notesQuery } from '~/queries/notes';

const { data: notes, refetch: refetchNotes, asyncStatus: notesStatus, state: notesState } = useQuery(notesQuery);
const modalOpen = ref(false);
const toggleModal = () => { modalOpen.value = !modalOpen.value };

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <Hx level="1">Notes</Hx>
      <div class="flex items-center gap-4">
        <UButton
          label="Refresh" icon="i-heroicons-arrow-path-16-solid"
          color="neutral" variant="subtle"
          @click="() => { refetchNotes() }" :disabled="notesStatus === 'loading'"
        />
        <UButton
          label="Add note" icon="i-heroicons-plus-16-solid"
          @click="toggleModal" v-if="notesState.data && notes && notes.length"
        />
      </div>
    </div>
    <div v-if="notesStatus === 'loading'">Fetching notes...</div>
    <div v-else-if="notesState.status === 'error'">Error!</div>
    <div v-else-if="notes && notes.length">
      <div class="grid grid-cols-2 gap-8">
        <NotesCard
          v-for="note in notes" :key="note.id" :note
        />
      </div>
    </div>
    <div
      v-else-if="notes && !notes.length"
      class="text-center flex flex-col items-center justify-center gap-4 bg-neutral-950/50 rounded-2xl p-8"
    >
      <h2>Nobody here but us chickens!</h2>
      <UButton
        label="Add note" icon="i-heroicons-plus-16-solid"
        @click="toggleModal"
      />
    </div>
    <ModalAddNote v-model:open="modalOpen"/>
  </div>
</template>