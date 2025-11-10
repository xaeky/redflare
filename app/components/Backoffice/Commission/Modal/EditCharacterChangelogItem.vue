<script setup lang="ts">
import { z } from 'zod';

const changelogItemState = defineModel<CommissionCharacterChangelog>('changelogItemState', {
  required: true
});

const emit = defineEmits<{
  (e: 'remove'): void
}>();
const schema = commissionChangelogSchema;
const toast = useToast();
const tempFile = ref<File | null>(null);
const tempFileUploading = ref(false);
const pad = (n: number) => String(n).padStart(2, '0');
const dateForInput = computed({
  get() {
    const raw = changelogItemState.value?.date;
    if (!raw) return '';
    const hasTZ = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(raw);
    const d = hasTZ ? new Date(raw) : new Date(raw + 'Z');
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
  set(val: string) {
    if (!changelogItemState.value) return;
    if (!val) return;
    // Parse local datetime into a Date, then use toISOString() (UTC) and strip ms + 'Z'
    const [datePart, timePart = '00:00:00'] = val.split('T');
    const [y, m, day] = (datePart as string).split('-').map(Number);
    const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map(Number);
    const localDate = new Date((y as number), (m ?? 1) - 1, day ?? 1, hh, mm, ss);
    changelogItemState.value.date = localDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
});

const handleFileUpload = async (file: File) => {
  let success = true;
  const form = new FormData();
  form.append('file', file);
  form.append('prefix', 'avatars');
  const result = await $fetch<{ success: boolean, id: string }>('/api/storage', { method: 'PUT', body: form }).catch(() => {
    success = false;
  });
  if (!success) return null;
  return result;
};
const handleFileDelete = async (fileId: string) => {
  let success = true;
  await $fetch('/api/storage', { method: 'DELETE', body: { id: fileId } }).catch(() => {
    success = false;
  });
  return success;
};
const handleFileRemove = async () => {
  if (!changelogItemState.value) return;
  const fileId = changelogItemState.value.file_id;
  if (!fileId) return;
  const secondaryModal = toast.add({ description: 'Removing file...', color: 'neutral' });
  const result = await handleFileDelete(fileId);
  if (result) toast.add({ description: 'Removed file successfully', color: 'success' });
  else toast.add({ description: 'Failed to remove file', color: 'error' });
  toast.remove(secondaryModal.id);
  changelogItemState.value.file_id = null;
};
const handleFileRemoveForm = () => {
  useConfirmationModal({
    message: 'Are you sure you want to remove the uploaded file? This action cannot be undone.',
    confirmLabel: 'Remove file',
    danger: true,
    onConfirm: () => { handleFileRemove(); }
  });
};
const handleVersionRemove = async () => {
  useConfirmationModal({
    message: 'Are you sure you want to remove this version? This action cannot be undone. Files will also be removed from storage.',
    confirmLabel: 'Remove version',
    danger: true,
    onConfirm: async () => {
      try {
        await handleFileRemove();
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
  else toast.add({ description: 'Failed to upload file', color: 'error' });
  const toastToRemove = toast.toasts.value.find(t => t.description === 'Uploading file...');
  if (toastToRemove) toast.remove(toastToRemove.id);
  if (!changelogItemState.value) return;
  changelogItemState.value.file_id = result ? result.id : null;
  tempFile.value = null;
});
</script>

<template>
  <UForm class="space-y-2 p-4 bg-muted/50 rounded-lg shadow-md" :state="changelogItemState" :schema>
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
      <div>Package file</div>
      <div>
        <div class="flex items-center gap-4" v-if="!changelogItemState.file_id">
          <UFileUpload
            v-model="tempFile"
            variant="button"
            accept="application/octet-stream,.unitypackage"
            placeholder="Upload package file (.unitypackage)"
            class="w-16 h-16"
            :disabled="tempFileUploading"
          />
          <div v-if="tempFileUploading">
            <SharedGeneralLoader text="Uploading package..." />
          </div>
        </div>
        <div
          v-if="changelogItemState.file_id && changelogItemState.file_id !== null && !(tempFileUploading)"
          class="space-y-1 p-2 border border-muted rounded-lg"
        >
          <UButton color="error" variant="soft" @click="handleFileRemoveForm" label="Remove uploaded file" icon="i-lucide-package-x" />
          <div class="font-mono w-96 text-ellipsis overflow-hidden text-xs" v-text="changelogItemState.file_id" />
        </div>
      </div>
    </div>
    <div v-if="changelogItemState" class="flex justify-end">
      <UButton color="error" variant="soft" @click="handleVersionRemove" label="Remove version" icon="i-lucide-trash-2" />
    </div>
  </UForm>
</template>