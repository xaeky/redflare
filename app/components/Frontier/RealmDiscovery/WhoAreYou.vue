<script setup lang="ts">
const emit = defineEmits<{
  'view-select': [realm: 'agent' | 'public'];
}>();
</script>

<template>
  <div class="realm-discovery-view-container">
    <div class="space-y-4">
      <p>Welcome, can you tell us what kind of user you are?</p>
      <div class="space-y-2">
        <FrontierRealmDiscoveryAuthRealmButton
          @click="emit('view-select', 'agent')"
          title="I am an artist"
          description="I'm a registered artist in this Redflare instance."
          icon="i-lucide-brush"
        />
        <FrontierRealmDiscoveryAuthRealmButton
          @click="emit('view-select', 'public')"
          title="I am a customer"
          description="I got commissions here!"
          icon="i-lucide-user-star"
        />
      </div>
    </div>
  </div>
</template>
