<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { avatarBasesQuery } from '~/queries/commissions';
import { BackofficeCommissionModalEditCharacterChangelog } from '#components';

const commissionFormStore = useCommissionFormStore();

const characterSchema = commissionCharacterOptionsSchema;
const formsCharacterRef = ref();

// Overlays
const overlay = useOverlay();
const editChangelogModalOverlay = overlay.create(BackofficeCommissionModalEditCharacterChangelog);

// Queries
const { data:remoteBasesRaw, isLoading:remoteBasesBusy } = useQuery(avatarBasesQuery);

// Computed queries
const remoteBases = computed(() => {
  if (!remoteBasesRaw.value) return [];
  return remoteBasesRaw.value.map(b => ({
    label: b.name,
    value: b._id
  }))
});

// Methods
function addCharacterObject() {
  const characterObject = {
    name: '',
    base: '',
    note: '',
    changelog: []
  };
  commissionFormStore.formState.characters.push(characterObject);
}

function handleCharacterChangelogEdit(characterIndex: number) {
  if (!commissionFormStore.formState.characters[characterIndex]) return;
  editChangelogModalOverlay.open({
    characterIndex, overlay: editChangelogModalOverlay
  });
} 

defineExpose({
  forms: formsCharacterRef
});
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-4">
      <div v-for="(character, index) in commissionFormStore.formState.characters" :key="index" class="space-y-4 bg-muted/50 p-4 rounded-lg shadow-xl">
        <UForm ref="formsCharacterRef" :state="character" :schema="characterSchema" class="space-y-2">
          <UFormField label="Character name" name="name">
            <UInput v-model="character.name" placeholder="Character name" class="w-full" />
          </UFormField>
          <UFormField label="Base avatar" name="base">
            <USelect
              v-model="character.base"
              :items="remoteBases"
              placeholder="Select base avatar"
              :loading="remoteBasesBusy"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Note" name="note">
            <UTextarea v-model="character.note" placeholder="Optional character note" class="w-full" />
          </UFormField>
        </UForm>
        <div class="flex items-center justify-between">
          <UButton
            icon="i-heroicons-trash-16-solid"
            color="error"
            variant="subtle"
            @click="commissionFormStore.formState.characters.splice(index, 1)"
            class="mb-2"
          />
          <UButton
            icon="i-heroicons-pencil-square-16-solid"
            color="neutral"
            variant="soft"
            @click="handleCharacterChangelogEdit(index)"
            class="mb-2"
            label="Edit changelog"
          />
        </div>
      </div>
    </div>
    <div>
      <UButton label="Add character" @click="addCharacterObject" icon="i-heroicons-plus-16-solid" block />
    </div>
  </div>
</template>