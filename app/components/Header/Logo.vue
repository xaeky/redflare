<script setup lang="ts">
import Logotype from '~/assets/svg/xa_logotype.svg';
withDefaults(defineProps<{
  size?: 'base' | 'lg' | 'xl';
}>(), {
  size: 'base'
});
</script>

<template>
  <div class="inline-block items-center gap-1 select-none">
    <Logotype
      class="w-auto inline-block text-primary-400"
      :class="{
        'h-9': size === 'base',
        'h-12': size === 'lg',
        'h-16': size === 'xl'
      }"
    />
  </div>
</template>