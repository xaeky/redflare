<script setup lang="ts">
definePageMeta({
  title: 'App Settings',
  description: 'Manage Redflare global settings.',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <BackofficeAppSettingsForm />
  </div>
</template>