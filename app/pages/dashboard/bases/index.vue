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

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div id="xarf_dash_bases" class="space-y-4">
    <div class="flex items-center justify-between">
      <Hx level="1">Avatar bases</Hx>
      <div class="space-x-4">
        <UButton
          label="Refresh" icon="i-heroicons-arrow-path-16-solid"
          color="neutral" variant="subtle" :loading="remoteBasesBusy"
          @click="() => { remoteBasesRefetch() }"
        />
        <UButton
          label="New base" icon="i-heroicons-plus-16-solid"
          @click="handleAddBaseButton"
        />
      </div>
    </div>
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