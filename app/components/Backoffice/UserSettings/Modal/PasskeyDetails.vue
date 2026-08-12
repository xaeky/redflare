<script setup lang="ts">
type OverlayInstance = ReturnType<ReturnType<typeof useOverlay>['create']>;

const props = defineProps<{
  passkey: AgentAccountPasskeyCredential;
  overlay: OverlayInstance;
}>();

const emit = defineEmits<(e: 'delete', credentialId: string) => void>();

const handleClose = () => props.overlay.close();
const handleDelete = () => {
  emit('delete', props.passkey.id);
  props.overlay.close();
};

const isMobile = useMediaQuery('(max-width: 640px)');
</script>

<template>
  <UModal title="Passkey Credential Details" :dismissible="false">
    <template #body>
      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-muted">Alias</div>
            <div class="font-medium">{{ passkey.alias }}</div>
          </div>
          <div>
            <div class="text-xs text-muted">Created</div>
            <div>
              {{ useDateFormat(passkey.createdAt, 'MMM Do YYYY, HH:MM') }}
            </div>
          </div>
          <div>
            <div class="text-xs text-muted">Last used</div>
            <div>
              {{ passkey.lastUsedAt ? useDateFormat(passkey.lastUsedAt, 'MMM Do YYYY, HH:MM') : 'Never' }}
            </div>
          </div>
          <div>
            <div class="text-xs text-muted">Backed up</div>
            <div>{{ passkey.backedUp ? 'Yes' : 'No' }}</div>
          </div>
          <div>
            <div class="text-xs text-muted">Sign count</div>
            <div>{{ passkey.counter }}</div>
          </div>
          <div v-if="passkey.transports?.length">
            <div class="text-xs text-muted">Transports</div>
            <div>{{ passkey.transports.join(', ') }}</div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 justify-between w-full">
        <UButton
          icon="i-heroicons-trash-16-solid"
          label="Delete passkey"
          color="error"
          @click="handleDelete"
          :block="isMobile"
        />
        <UButton
          color="neutral"
          variant="subtle"
          label="Close"
          @click="handleClose"
          :block="isMobile"
        />
      </div>
    </template>
  </UModal>
</template>
