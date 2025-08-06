<script setup lang="ts">
import _ from 'lodash';
import { avatarBasesQuery } from '~/queries/commissions';
import { BackofficeBasesAddSlideover, BackofficeBasesEditSlideover } from '#components';

const { data:remoteBases, isLoading:remoteBasesBusy, refetch:remoteBasesRefetch } = useQuery(avatarBasesQuery);

// Overlays
const overlay = useOverlay();
const addSlideoverOverlay = overlay.create(BackofficeBasesAddSlideover);
const editSlideoverOverlay = overlay.create(BackofficeBasesEditSlideover);

function handleAddBaseButton() {
  addSlideoverOverlay.open();
}

function handleEditBaseButton(base: DeserializedAvatarBase) {
  editSlideoverOverlay.open({ base });
}

const actions:PageAction[] = [
  {
    label: 'Refresh',
    icon: 'i-heroicons-arrow-path-16-solid',
    color: 'neutral',
    variant: 'subtle',
    action: () => { remoteBasesRefetch(); }
  },
  {
    label: 'New base',
    icon: 'i-heroicons-plus-16-solid',
    action: handleAddBaseButton
  }
];

definePageMeta({
  title: 'Avatar bases',
  description: 'Manage your avatar bases for commissions',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <BackofficeHeaderActions :actions />
    <UAlert
      description="When managing commissions, you'll need to annotate the avatar bases that you own."
      color="neutral" variant="soft" icon="i-lucide-info"
    />
    <div v-if="remoteBasesBusy">
      Fetching remote avatar bases...
    </div>
    <ul v-else-if="remoteBases && !remoteBasesBusy" class="grid grid-cols-2 gap-4">
      <BackofficeBasesGridItem v-for="base in remoteBases" :key="base._id" :base @edit="handleEditBaseButton" />
    </ul>
  </div>
</template>