<script setup lang="ts">
const route = useRoute();

const title = computed(() => {
  return route.meta.title || '';
});
const actions = computed(() => {
  return route.meta.actions || [];
});
</script>

<template>
  <UApp>
    <div id="redflare_restricted">
      <header id="redflare_backoffice_head">
        <div class="w-full border-b border-neutral-800">
          <div class="container mx-auto px-12 flex items-stretch justify-between">
            <HeaderLogo />
            <HeaderSession />
          </div>
        </div>
      </header>
      <div id="redflare_backoffice_contentwrapper" class="container mx-auto px-12 flex">
        <BackofficeSidebar />
        <div id="redflare_backoffice_content" class="px-12 py-6 w-full">
          <div id="redflare_backoffice_content_header" class="flex items-center justify-between mb-6">
            <Hx level="1">{{ title }}</Hx>
            <div class="rf_backoffice_content_header_actions">
              <UButton
                v-for="action in actions"
                :key="action.label"
                :label="action.label"
                :icon="action.icon"
                :color="action.color"
                :variant="action.variant"
                @click="action.action"
              />
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

.rf_backoffice_content_header_actions {
  @apply flex items-center gap-4;
}
</style>