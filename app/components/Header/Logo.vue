<script setup lang="ts">
import xaLogotypeSvg from '~/assets/svg/xa_logotype.svg';

const runtime = useRuntimeConfig();
const isProduction = runtime.public.redflare_env === 'production';
</script>

<template>
  <div class="flex items-center gap-1 select-none">
    <img :src="xaLogotypeSvg" class="h-12 inline-block" />
    <UBadge v-if="!isProduction" :label="runtime.public.redflare_env" variant="subtle" />
  </div>
</template>