<script setup lang="ts">
const commissionFormStore = useCommissionFormStore();

const props = defineProps<{
  changelogIndex: number
  characterIndex: number
}>();

const changelogItemState = commissionFormStore.formState.characters[props.characterIndex]?.changelog[props.changelogIndex];

const emit = defineEmits<{
  (e: 'remove'): void
}>();
const toast = useToast();
const tempFile = ref<File | null>(null);
const tempFileUploading = ref(false);
const pad = (n: number) => String(n).padStart(2, '0');
const dateForInput = computed({
  get() {
    const raw = changelogItemState?.date;
    if (!raw) return '';
    const hasTZ = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(raw);
    const d = hasTZ ? new Date(raw) : new Date(raw + 'Z');
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
  set(val: string) {
    if (!changelogItemState) return;
    if (!val) return;
    // Parse local datetime into a Date, then use toISOString() (UTC) and strip ms + 'Z'
    const [datePart, timePart = '00:00:00'] = val.split('T');
    const [y, m, day] = (datePart as string).split('-').map(Number);
    const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map(Number);
    const localDate = new Date((y as number), (m ?? 1) - 1, day ?? 1, hh, mm, ss);
    changelogItemState.date = localDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
});

const handleFileUpload = async (file: File) => {
  let success = true;
  const form = new FormData();
  form.append('file', file);
  form.append('prefix', 'avatars');
  const result = await $fetch<{ success: boolean, id: string, storageId: string }>('/api/storage', { method: 'PUT', body: form }).catch(() => {
    success = false;
  });
  if (!success) return null;
  return result;
};
const handleFileDelete = async (attachmentId: string) => {
  let success = true;
  await $fetch('/api/storage', { method: 'DELETE', body: { id: attachmentId } }).catch(() => {
    success = false;
  });
  return success;
};
const handleFileRemove = async (attachmentId: string) => {
  if (!changelogItemState) return;
  if (!attachmentId) return;
  const secondaryModal = toast.add({ description: 'Removing file...', color: 'neutral' });
  const result = await handleFileDelete(attachmentId);
  if (result) toast.add({ description: 'Removed file successfully', color: 'success' });
  else toast.add({ description: 'Failed to remove file', color: 'error' });
  toast.remove(secondaryModal.id);
  changelogItemState.attachments = changelogItemState.attachments?.filter(a => a !== attachmentId) || [];
};
const handleFileRemoveForm = (attachmentId: string) => {
  const thisAttachment = commissionFormStore.additionalState.attachments[attachmentId];
  useConfirmationModal({
    message: `Are you sure you want to remove the ${thisAttachment?.filename}? This action cannot be undone.`,
    confirmLabel: 'Remove file',
    danger: true,
    onConfirm: () => handleFileRemove(attachmentId)
  });
};
const handleVersionRemove = async () => {
  useConfirmationModal({
    message: 'Are you sure you want to remove this version? This action cannot be undone. Files will also be removed from storage.',
    confirmLabel: 'Remove version',
    danger: true,
    onConfirm: async () => {
      try {
        // Remove all attached files by using Promise.all
        if (changelogItemState?.attachments && changelogItemState.attachments.length > 0) {
          await Promise.all(changelogItemState.attachments.map(attId => handleFileDelete(attId)));
        }
        emit('remove');
      } catch (e) {
        toast.add({ description: 'Failed to remove version', color: 'error' });
      }
    }
  });
};

watch(tempFile, async (newFile) => {
  if (!newFile) return;
  tempFileUploading.value = true;
  toast.add({ description: 'Uploading file...', color: 'neutral' });
  const result = await handleFileUpload(newFile);
  tempFileUploading.value = false;
  if (result && result.success) toast.add({ description: 'Uploaded file successfully', color: 'success' });
  else return toast.add({ description: 'Failed to upload file', color: 'error' });
  const toastToRemove = toast.toasts.value.find(t => t.description === 'Uploading file...');
  if (toastToRemove) toast.remove(toastToRemove.id);
  if (!changelogItemState) return;
  changelogItemState.attachments ||= [];
  // Append file details to store
  commissionFormStore.addAttachmentMetadata(result.id as string, {
    id: result.storageId as string,
    filename: newFile.name,
    filetype: getContentTypeByExtension(newFile.name),
    size: newFile.size,
  });
  // Push attachment ID to changelog attachments
  changelogItemState.attachments?.push(result?.id as string);
  tempFile.value = null;
});
</script>

<template>
  <div class="space-y-2 p-4 bg-muted/50 rounded-lg shadow-md" v-if="changelogItemState">
    <div class="flex gap-4">
      <UFormField label="Date" name="date" :required="true" class="flex-1">
        <UInput v-model="dateForInput" class="w-full" type="datetime-local" />
      </UFormField>
      <UFormField label="Version" name="version" :required="true">
        <UInput v-model="changelogItemState.version" class="w-full font-mono" type="text" />
      </UFormField>
    </div>
    <div class="space-y-2">
      <span class="text-sm">Changes</span>
      <div v-for="(_item, itemIndex) in changelogItemState.items" :key="itemIndex" class="flex items-center gap-2">
        <UInput v-model="changelogItemState.items[itemIndex]" placeholder="Describe the change made..." class="w-full" />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="outline"
          size="sm"
          @click="changelogItemState.items.splice(itemIndex, 1)"
        />
      </div>
      <div class="flex justify-start">
        <UButton color="neutral" variant="soft" @click="changelogItemState.items.push('')" label="Add change" />
      </div>
    </div>
    <div class="space-y-2">
      <h3>Attachments</h3>
      <div class="flex items-center gap-4">
        <div v-for="attachment in changelogItemState.attachments" :key="attachment">
          <UTooltip class="w-full h-full" :text="commissionFormStore.additionalState.attachments[attachment]?.filename || 'Unknown file'">
            <div class="rf-backoffice-commission-modal-file" @click.stop="handleFileRemoveForm(attachment)">
              <UIcon name="i-lucide-file-text" />
            </div>
          </UTooltip>
        </div>
        <div class="rf-backoffice-commission-modal-file empty">
          <UFileUpload
            v-model="tempFile"
            variant="button"
            :accept="getAllowedAttachmentExtensions().map(ext => '.' + ext).join(',')"
            class="w-16 h-16"
            :disabled="tempFileUploading"
          />
        </div>
      </div>
    </div>
    <div v-if="changelogItemState" class="flex justify-end">
      <UButton color="error" variant="soft" @click="handleVersionRemove" label="Remove version" icon="i-lucide-trash-2" />
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-backoffice-commission-modal-file {
  @apply w-16 h-16 rounded-lg cursor-pointer flex items-center justify-center bg-muted/50 hover:bg-muted/70 duration-150;
  &.empty {
    @apply border border-dashed border-muted/50;
  }
}
</style>