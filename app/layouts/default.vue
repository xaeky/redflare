<script setup lang="ts">
import xaLogotypeSvg from '~/assets/svg/xa_logotype.svg';
const route = useRoute();

const title = computed<string>(() => (route.meta.title as string) || '');

useHead({
  titleTemplate: '%s - Redflare Console',
  title
});
</script>

<template>
  <UApp>
    <div id="rf-default">
      <div class="container mx-auto px-6 md:px-12 py-6 flex-1 grid">
        <slot />
      </div>
    </div>
  </UApp>
</template>

<style scoped>
@reference '~/assets/global.css';

#rf-default {
  @apply min-h-screen flex flex-col;
}
</style>