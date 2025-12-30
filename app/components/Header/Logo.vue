<script setup lang="ts">
import XaLogotypeSvg from '~/assets/svg/xa_logotype.svg';

const runtime = useRuntimeConfig();
const isProduction = runtime.public.redflare_env === 'production';
</script>

<template>
  <div class="flex items-center gap-1 select-none">
    <XaLogotypeSvg class="h-12 w-auto inline-block text-primary-400" />
    <UBadge v-if="!isProduction" :label="runtime.public.redflare_env" variant="subtle" />
  </div>
</template>