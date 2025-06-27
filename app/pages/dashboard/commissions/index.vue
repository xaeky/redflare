<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div id="xarf_dash_commissions">
    <div>
      <Hx level="1">Commissions</Hx>
    </div>
  </div>
</template>