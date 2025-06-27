<script setup lang="ts">
const props = defineProps<{
  level: string | number
}>();

const normalizedLevel = Number(props.level) || 4
</script>

<template>
  <div :class="{
    'text-4xl': normalizedLevel === 1,
    'text-3xl': normalizedLevel === 2,
    'text-2xl': normalizedLevel === 3,
    'text-xl': normalizedLevel === 4,
    'font-bold': normalizedLevel < 4
  }">
    <slot />
  </div>
</template>