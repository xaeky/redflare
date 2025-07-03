<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionCharactersQuery, commissionsBasesQuery } from '~/queries/commissions';

// Props
const props = defineProps<{
  commissionId: string
}>();
const newCharacterActive = ref(false);
const newCharacterSchema = commissionCharacterOptionsSchema;
type NewCharacterSchema = z.output<typeof newCharacterSchema>;
const newCharacterDefault:NewCharacterSchema = {
  name: '',
  base: '',
  note: '',
  changelog: {}
};
const newCharacterState = reactive<NewCharacterSchema>(_.cloneDeep(newCharacterDefault));

// Functions

function toggleNewCharacterActive(newStatus = true, clearNewCharacter?:boolean) {
  newCharacterActive.value = typeof newStatus === 'boolean' ? newStatus : !newCharacterActive.value;
  // @ts-expect-error
  if (clearNewCharacter) newCharacterState.value = _.cloneDeep(newCharacterDefault);
}

const addCharacterDraft = () => { toggleNewCharacterActive(true) };

// Queries
const queryCache = useQueryCache();
const { data:remoteCharactersRaw, isLoading:remoteCharactersBusy } = useQuery(commissionCharactersQuery({ commissionId: props.commissionId }));
const { data:remoteBasesRaw, isLoading:remoteBasesBusy } = useQuery(commissionsBasesQuery);

// Computed queries
const remoteBases = computed(() => {
  if (!remoteBasesRaw.value) return [];
  return remoteBasesRaw.value.map(b => ({
    label: b.name,
    value: b.id
  }))
});

// States
const remoteCharactersStateOld = ref<WithId<SerializedCommissionCharacterOptions>[]>([]);
const remoteCharactersState = ref<WithId<SerializedCommissionCharacterOptions>[]>([]);

// Mutations
const { mutate:addCommissionCharacter, isLoading: addCommissionCharacterBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions/${props.commissionId}/characters`, {
    method: 'POST',
    body: newCharacterState
  }),
  onSuccess() {
    toggleNewCharacterActive(false, true);
    queryCache.invalidateQueries(commissionCharactersQuery({ commissionId: props.commissionId }))
  }
});

const { mutate:deleteRemoteCharacter } = useMutation({
  mutation: ({ characterId }: { characterId: string }) => useAPI(`/api/commissions/${props.commissionId}/characters/${characterId}`, {
    method: 'DELETE'
  }),
  onSuccess() { queryCache.invalidateQueries(commissionCharactersQuery({ commissionId: props.commissionId })) }
});

const { mutate:updateRemoteCharacter, isLoading:updateRemoteCharacterBusy  } = useMutation({
  mutation: ({ characterId }: { characterId: string }) => useAPI(`/api/commissions/${props.commissionId}/characters/${characterId}`, {
    method: 'PUT', body: remoteCharactersState.value.find(rc => rc.id === characterId)
  }),
  onSuccess() { queryCache.invalidateQueries(commissionCharactersQuery({ commissionId: props.commissionId })) }
})

// Handlers & methods
function handleSubmitAddCharacter() {
  addCommissionCharacter()
}

// Computed vars
const remoteCharacterHasChanged = (characterId: string) => computed(() => {
  const oldRev = remoteCharactersStateOld.value.find(ch => ch.id === characterId);
  const newRev = remoteCharactersState.value.find(ch => ch.id === characterId);
  if (!oldRev || !newRev) return true;
  return !_.isEqual(oldRev, newRev);
});

// Watchers
watch(remoteCharactersRaw, (newCharacters) => {
  if (!newCharacters || !newCharacters.length) return;
  const serializedCharacters:WithId<SerializedCommissionCharacterOptions>[] = newCharacters.map(({ name, base, note, changelog, id }) => ({
    name, base: base.id, note, changelog, id
  }));
  remoteCharactersState.value = serializedCharacters;
  remoteCharactersStateOld.value = _.cloneDeep(serializedCharacters);
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="!remoteCharactersState.length && !remoteCharactersBusy" class="space-y-4">
      <UAlert description="Start adding a character for this commission!" color="neutral" variant="subtle" />
      <UButton label="Add character" @click="addCharacterDraft" icon="i-heroicons-plus-16-solid" v-if="!newCharacterActive" />
    </div>
    <div v-else-if="remoteCharactersState.length && !remoteCharactersBusy" class="space-y-4">
      <div class="flex items-center justify-between">
        <Hx level="2">Characters</Hx>
        <UButton label="Add character" @click="addCharacterDraft" icon="i-heroicons-plus-16-solid" v-if="!newCharacterActive" />
      </div>
      <ul class="space-y-4">
        <li v-for="(char, charIdx) in remoteCharactersState" :key="charIdx" class="bg-neutral-800/50 p-4 rounded-xl space-y-4">
          <div class="flex items-center justify-between">
            <Hx level="3">Character {{ charIdx + 1 }}</Hx>
            <UButton icon="i-heroicons-trash-16-solid" color="error" @click="deleteRemoteCharacter({ characterId: char.id })" />
          </div>
          <UForm :state="char" :schema="newCharacterSchema" @submit="updateRemoteCharacter({ characterId: char.id })" class="space-y-4">
            <UFormField label="Name" name="name">
              <UInput name="name" v-model="char.name" class="w-full" />
            </UFormField>
            <UFormField label="Base" name="base">
              <USelectMenu :items="remoteBases" name="base" valueKey="value" v-model="char.base" class="w-full" />
            </UFormField>
            <UFormField label="Note" name="note">
              <UInput name="note" v-model="char.note" class="w-full" />
            </UFormField>
            <div v-if="remoteCharacterHasChanged(char.id).value">
              <UButton
                type="submit" label="Save character changes" block
                :loading="updateRemoteCharacterBusy" />
            </div>
          </UForm>
        </li>
      </ul>
    </div>
    <div v-else-if="remoteCharactersBusy">
      Fetching characters...
    </div>
    <div v-if="newCharacterActive" class="border border-neutral-800 p-4 rounded-xl space-y-4">
      <div class="flex items-center justify-between">
        <Hx level="3">New character</Hx>
        <UButton icon="i-heroicons-trash-16-solid" color="error" @click="toggleNewCharacterActive(false, true)" />
      </div>
      <UForm :schema="newCharacterSchema" :state="newCharacterState" @submit="handleSubmitAddCharacter" class="space-y-4">
        <UFormField label="Name" name="name">
          <UInput name="name" v-model="newCharacterState.name" class="w-full" />
        </UFormField>
        <UFormField label="Base" name="base">
          <USelectMenu :items="remoteBases" name="base" valueKey="value" v-model="newCharacterState.base" class="w-full" />
        </UFormField>
        <UFormField label="Note" name="note">
          <UInput name="note" v-model="newCharacterState.note" class="w-full" />
        </UFormField>
        <div>
          <UButton label="Save character" type="submit" />
        </div>
      </UForm>
    </div>
  </div>
</template>