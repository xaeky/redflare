<script setup lang="ts">
definePageMeta({
  title: 'App Settings',
  description: 'Manage Redflare global settings.',
  middleware: 'agent-only',
  layout: 'backoffice',
  keepalive: true,
});
</script>

<template>
  <div>
    <BackofficeAppSettingsForm />
  </div>
</template>
