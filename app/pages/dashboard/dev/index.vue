<script setup lang="ts">
const devLinks = [
  {
    label: 'Session',
    to: '/dashboard/dev/session'
  }
]

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <ul>
    <li v-for="link in devLinks" :key="link.to">
      <NuxtLink :to="link.to" class="bg-neutral-800 py-4 px-8 rounded-xl">
        <span v-text="link.label" />
      </NuxtLink>
    </li>
  </ul>
</template>