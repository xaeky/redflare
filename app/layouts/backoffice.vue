<script setup lang="ts">
const route = useRoute();

const title = computed<string>(() => (route.meta.title as string) || '');
const description = computed<string>(() => (route.meta.description as string) || '');

useHead({
  titleTemplate: '%s - Redflare Backoffice',
  title
});
</script>

<template>
  <UApp>
    <div class="rf_restricted">
      <div class="rf_backoffice_contentwrapper">
        <BackofficeSidebar />
        <div class="rf_backoffice_content">
          <div id="rf_backoffice_content_header" class="flex items-center justify-between mb-6">
            <div>
              <h1 v-text="title" />
              <span v-if="description" v-text="description" class="text-muted" />
            </div>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </UApp>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf_restricted {
  @apply flex flex-col h-screen;
}

.rf_backoffice_head {
  @apply sticky top-0 z-50 inset-x-0 bg-neutral-900 w-full border-b border-neutral-800;
}

.rf_backoffice_contentwrapper {
  @apply flex flex-1 ;
}

.rf_backoffice_content {
  @apply px-12 py-6 w-full overflow-y-auto;
}

.rf_backoffice_content_header_actions {
  @apply flex items-center gap-4;
}

#rf_backoffice_content_header h1 {
  @apply text-3xl font-bold;
}
</style>