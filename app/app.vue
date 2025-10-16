<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' }
  ]
});
</script>

<template>
  <main id="redflare_root">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </main>
</template>
