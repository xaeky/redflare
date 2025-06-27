<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <h2>Welcome!</h2>
  </div>
</template>