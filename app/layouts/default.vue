<script setup lang="ts">
import xaLogotypeSvg from '~/assets/svg/xa_logotype.svg';
</script>
<template>
  <UApp>
    <div id="redflare_default">
      <div class="p-4 text-center w-full">
        <img :src="xaLogotypeSvg" class="h-18 inline-block" />
      </div>
      <div class="container mx-auto px-6 md:px-12 py-6">
        <slot />
      </div>
    </div>
  </UApp>
</template>