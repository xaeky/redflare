<script setup lang="ts">
const dbStatus = await useAPI('/api/service/database/health');

definePageMeta({
  title: 'Database Health',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <pre v-text="dbStatus" />
  </div>
</template>
