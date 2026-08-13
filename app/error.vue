<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
  error: Object as () => NuxtError,
});

const mapErrors: { [key: number]: string } = {
  400: 'Bad request',
  401: 'Need authentication',
  403: 'Missing permissions',
  404: "It doesn't exist!",
  500: 'Avvy Error',
};
</script>

<template>
  <main id="app-error-root">
    <div
      id="app-error"
      class="container mx-auto px-12 min-h-screen flex flex-col justify-center"
    >
      <div v-if="props.error" class="font-mono">
        <h1 v-text="props.error.status" />
        <div
          v-text="props.error.statusMessage || mapErrors[props.error.status as number] || 'Unknown error'"
        />
      </div>
      <div class="my-4" v-if="props.error?.stack">
        <pre v-text="props.error.stack" />
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "~/assets/global.css";

h1 {
  @apply text-4xl font-bold text-primary;
}
</style>
