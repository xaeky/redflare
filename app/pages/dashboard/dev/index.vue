<script setup lang="ts">
const devLinks = [
  {
    label: 'Database Health',
    to: '/dashboard/dev/database'
  }
]

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <ul class="grid grid-cols-2 gap-12 p-8">
    <li v-for="link in devLinks" :key="link.to">
      <NuxtLink :to="link.to" class="block bg-neutral-800 py-4 px-8 rounded-xl w-full">
        <span v-text="link.label" />
      </NuxtLink>
    </li>
  </ul>
</template>