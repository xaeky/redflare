<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
});

const mapErrors: { [key: number]: string } = {
  400: 'Bad request',
  401: 'Need authentication',
  403: 'Missing permissions',
  404: 'It doesn\'t exist!',
  500: 'Redflare Error'
}

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <main id="redflare_default">
    <div id="redflare_error" class="container mx-auto px-12 py-6">
      <div v-if="props.error">
        <h1 v-text="props.error.statusCode" />
        <div v-text="mapErrors[props.error.statusCode] || 'Unknown error'"/>
      </div>
      <div class="pt-4">
        <UButton @click="handleError" label="Reload" />
      </div>
    </div>
  </main>
</template>
