<script setup lang="ts">
import { BackofficeBasesEditSlideover } from '#components';
import _ from 'lodash';

const props = defineProps<{
  base: DeserializedAvatarBase 
}>();

const avatarBaseFormStore = useAvatarBaseFormStore();
const overlay = useOverlay();

function handleEditButton() {
  _.assign(avatarBaseFormStore.formState, _.pick(props.base, Object.keys(avatarBaseFormStore.schema.shape)));
  avatarBaseFormStore.additionalState.id = props.base._id as string;
  overlay.create(BackofficeBasesEditSlideover, { destroyOnClose: true }).open();
}
</script>

<template>
  <li class="p-4 bg-neutral-800/50 rounded-xl space-y-2 select-none">
    <div class="flex items-center gap-4">
      <span v-text="base.name" class="text-2xl font-bold" />
      <ULink v-if="base.storefront_url" external target="_blank" :to="base.storefront_url">
        <UButton size="sm" label="View in store" color="neutral" variant="soft" icon="i-lucide-external-link" />
      </ULink>
    </div>
    <div>by {{ base.creator_name }}</div>
    <div class="flex justify-between items-center">
      <span v-text="base._id" class="font-mono text-xs select-all" />
      <div class="flex items-center gap-2">
        <UButton label="Edit base" icon="i-lucide-pencil" variant="soft" @click="handleEditButton" />
      </div>
    </div>
  </li>
</template>