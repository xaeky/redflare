<script setup lang="ts">
import type { FetchError } from 'ofetch';

const props = defineProps<{
  commission: string;
  changelog: CommissionCharacterChangelog[];
  attachments: Record<string, CommissionCharacterAttachmentRaw>;
}>();

const toast = useToast();

const handleAttachmentDownload = async (attachmentId: string) => {
  const prepareToast = toast.add({ description: 'Preparing download...', progress: false, type: 'foreground', icon: 'i-lucide-download', duration: 20000 });
  const encoded = encodeURIComponent(attachmentId);
  const url = `/api/public/commissions/${props.commission}/retrieve_attachment?file_id=${encoded}`;
  try {
    await $fetch.raw(url, { method: 'HEAD', credentials: 'same-origin' });
    location.assign(url);
    toast.remove(prepareToast.id);
    toast.add({ description: 'Download started.', icon: 'i-lucide-circle-check-big', color: 'success' });
  } catch (error) {
    toast.remove(prepareToast.id);
    const fetchError = error as FetchError;
    if (!fetchError.status) {
      toast.add({ description: 'Network error occurred while preparing download.', color: 'error' });
      return;
    }
    if (fetchError.status === 403) toast.add({ description: 'You do not have permission to download this file.', color: 'error' });
    else if (fetchError.status === 404) toast.add({ description: 'File not found.', color: 'error' });
    else toast.add({ description: 'Failed to prepare download.', color: 'error' });
  }
};

const formatTime = (t: string) => useTimeAgo(new Date(t)).value;
</script>

<template>
  <UModal title="Character releases">
    <template #body>
      <div class="rf_shared_ro_character_changelog">
        <div v-for="(entry, index) in changelog" :key="index" class="changelog_entry">
          <div class="changelog_title">
            <span v-text="entry.version" />
          </div>
          <div>
            <span class="text-sm text-muted">
              Released {{ formatTime(entry.date) }}
            </span>
          </div>
          <div>
            <UCollapsible class="flex flex-col gap-2 w-48">
              <UButton label="View changes" color="neutral" variant="subtle" trailing-icon="i-lucide-chevron-down" block/>
              <template #content>
                <ul class="changelog_items">
                  <li v-for="(item, itemIndex) in entry.items" :key="itemIndex">{{ item }}</li>
                </ul>
              </template>
            </UCollapsible>
          </div>
          <div v-if="entry.attachments && entry.attachments.length" class="release_files">
            <div v-for="attachment in entry.attachments" :key="attachment">
              <div class="release_attachment group" @click="handleAttachmentDownload(attachment)">
                <div>
                  <div class="bg-neutral-950/50 rounded-full w-12 h-12 flex items-center justify-center group-hover:text-primary group-active:scale-90 duration-100">
                    <UIcon name="i-lucide-download" size="16"/>
                  </div>
                </div>
                <div>
                  <div class="filename" v-text="attachments[attachment]?.filename" />
                  <div class="details">
                    {{ attachments[attachment]?.filetype }} • {{ formatFileSize(attachments[attachment]?.size as number) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf_shared_ro_character_changelog {
  @apply space-y-4;
  .changelog_entry { @apply space-y-2 p-4 border border-muted/50 rounded-xl; }
  .changelog_title { @apply text-2xl font-bold text-primary; }
  .changelog_items { @apply list-disc pl-6 space-y-1; }
  .release_files { @apply flex flex-col gap-4; }
  .release_attachment {
    @apply p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted duration-100 flex items-center gap-4 select-none;
    .filename { @apply font-mono; }
    .details { @apply text-sm text-muted; }
  }
}
</style>
