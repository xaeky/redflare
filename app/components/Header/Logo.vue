<script setup lang="ts">
import xaLogotypeSvg from '~/assets/svg/xa_logotype.svg';

const runtime = useRuntimeConfig();
const isProduction = runtime.public.env === 'production';
</script>

<template>
  <div class="flex items-center gap-2 select-none">
    <img :src="xaLogotypeSvg" class="h-12 inline-block" />
    <span class="font-mono text-xs uppercase bg-warning-400 text-black py-1 px-2" v-if="!isProduction" v-text="runtime.public.env" />
  </div>
</template>