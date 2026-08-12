<script setup lang="ts">
definePageMeta({
  title: 'Under Maintenance',
});

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
});
const isMobile = breakpoints.smaller('sm');
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="py-2 mx-auto">
        <HeaderLogo :size="isMobile ? 'lg' : 'xl'" />
      </div>
      <div>
        <h1>Under Maintenance</h1>
        <p>
          We are currently performing maintenance on the platform. Please check
          back later.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/global.css";

h1 {
  @apply text-3xl font-bold text-primary;
}
</style>
