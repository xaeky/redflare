<script setup lang="ts">
const publicSession = usePublicUserSession();
const isPublicLoggedIn = computed(() => publicSession.isLoggedIn.value);

const handleLogin = () => {
  navigateTo('/api/public/auth/discord', { external: true, replace: true });
}

const handleLogout = () => {
  publicSession.clear();
  invokeInfoToast({
    title: 'You\'ve been logged out as customer',
  })
}

const isMobile = useMediaQuery('(max-width: 640px)');
const customerName = computed(() => publicSession.session.value?.user?.username || 'customer');
const authTitle = computed(() => isPublicLoggedIn.value ? `Welcome back, ${customerName.value}!` : 'Authenticate as a customer');

const emit = defineEmits<{
  'view-back': [];
}>();
</script>

<template>
  <div class="realm-discovery-view-container space-y-4">
    <div class="text-left">
      <UButton
        @click="emit('view-back')" label="Back" variant="subtle" icon="i-lucide-arrow-left" color="neutral"
        :block="isMobile" :size="isMobile ? 'lg' : 'sm'"
      />
    </div>
    <h2 v-text="authTitle" />
    <div v-if="!isPublicLoggedIn">
      <UButton label="Log in with Discord" size="xl"
        icon="i-mingcute-discord-fill" color="primary" :block="isMobile"
        @click="handleLogin"
      />
    </div>
    <div v-else class="flex flex-col gap-4">
      <div>
        <UButton
          label="Go to Commissions" size="xl" to="/me"
          color="primary" :block="isMobile"
        />
      </div>
      <div>
        <UButton
          label="Log out" size="xl" @click="handleLogout"
          icon="i-lucide-log-out" color="neutral" variant="soft" :block="isMobile"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

h2 {
  @apply text-xl font-bold;
}
</style>