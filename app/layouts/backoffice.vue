<script setup lang="ts">
const route = useRoute();

const title = computed(() => route.meta.title || '');
const description = computed(() => route.meta.description || '');
</script>

<template>
  <UApp>
    <div class="rf_restricted">
      <header class="rf_backoffice_head">
        <UContainer>
          <div class="flex items-stretch justify-between">
            <HeaderLogo />
            <HeaderSession />
          </div>
        </UContainer>
      </header>
      <UContainer class="flex flex-grow">
        <div class="rf_backoffice_contentwrapper">
          <BackofficeSidebar />
          <div id="rf_backoffice_content" class="px-12 py-6 w-full">
            <div id="rf_backoffice_content_header" class="flex items-center justify-between mb-6">
              <div>
                <Hx level="1">{{ title }}</Hx>
                <span v-if="description" v-text="description" class="text-muted" />
              </div>
            </div>
            <slot />
          </div>
        </div>
      </UContainer>
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
  @apply flex flex-grow;
}

.rf_backoffice_content_header_actions {
  @apply flex items-center gap-4;
}
</style>