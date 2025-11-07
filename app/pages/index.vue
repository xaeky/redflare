<script setup lang="ts">
definePageMeta({
  title: 'Welcome'
});

const agentSession = useUserSession();
const isAgentLoggedIn = computed(() => agentSession.loggedIn.value);

const publicSession = usePublicUserSession();
const isPublicLoggedIn = computed(() => publicSession.isLoggedIn.value);

const handleLoginDoor = (type: 'public' | 'agent') => {
  const loginUrls = {
    agent: '/api/auth/auth0',
    public: '/api/public/auth/discord'
  }
  navigateTo(loginUrls[type], { external: true, replace: true });
}

const handleWelcomeDoor = (type: 'public' | 'agent') => {
  const welcomeUrls = {
    agent: '/dashboard',
    public: '/me'
  }
  navigateTo(welcomeUrls[type], { external: true, replace: true });
}
</script>

<template>
  <div class="text-center space-y-4">
    <h1>Xaeky's Avatar Console</h1>
    <p>Please log in to your respective account to continue.</p>
    <div class="flex justify-center items-center">
      <div class="rf-login-card">
        <div v-if="!isPublicLoggedIn" class="frontier-content">
          <h2>Log In</h2>
          <UButton @click="handleLoginDoor('public')" label="Log in with Discord" icon="i-ic-baseline-discord" />
        </div>
        <div v-else class="welcome-content">
          <PublicSessionCard />
          <UButton @click="handleWelcomeDoor('public')" label="Go to Account" trailing-icon="i-heroicons-arrow-right-20-solid" />
        </div>
        <USeparator />
        <div>
          <UButton v-if="!isAgentLoggedIn" variant="soft" size="sm" label="I'm an Agent" @click="handleLoginDoor('agent')" />
          <UButton v-else variant="soft" size="sm" label="Continue as Agent" @click="handleWelcomeDoor('agent')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-login-card {
  @apply bg-muted/50 rounded-xl p-6 space-y-4;
  .frontier-content { @apply text-center flex flex-col items-center gap-4; }
  .welcome-content {
    @apply text-center flex flex-col items-center gap-4;
    .welcome-header {
      @apply flex items-center gap-2;
    }
  }

}

h1 {
  @apply text-3xl font-bold;
}
h2 {
  @apply text-2xl font-bold;
}
</style>