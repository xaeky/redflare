<script setup lang="ts">
useHead({
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
});
</script>

<template>
  <main id="avvy_root">
    <NuxtLoadingIndicator color="#00d3f2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>
</template>
