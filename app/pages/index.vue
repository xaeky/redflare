<script setup lang="ts">
definePageMeta({
  title: 'Welcome back'
});

const runtimeConfig = useRuntimeConfig();

const legalPages = [
  { name: 'Terms of Service', to: runtimeConfig.public.legal.serviceUrl },
  { name: 'Privacy Policy', to: runtimeConfig.public.legal.privacyUrl }
];

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

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
});

const isMobile = breakpoints.smaller('sm');
const isDesktop = breakpoints.greater('lg');
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="py-2 mx-auto">
        <HeaderLogo :size="isMobile ? 'lg' : 'xl'" />
      </div>
      <div>
        <h1>Avatars Console</h1>
        <p>Please log in to your respective account to continue.</p>
      </div>
      <div class="flex flex-col gap-4 justify-center items-center">
        <div
          class="flex flex-col items-center gap-4 lg:gap-8"
          :class="{
            'lg:flex-row': !isPublicLoggedIn,
          }"
        >
          <div class="rf-login-card">
            <div v-if="!isPublicLoggedIn" class="card-icon">
              <UIcon name="i-heroicons-sparkles-solid" class="size-8" />
            </div>
            <div v-if="!isPublicLoggedIn" class="frontier-content card-content">
              <h2>I'm a customer</h2>
              <UButton @click="handleLoginDoor('public')" label="Log in with Discord" icon="i-ic-baseline-discord" />
            </div>
            <div v-else class="welcome-content card-content">
              <PublicSessionCard size="sm" />
              <UButton block @click="handleWelcomeDoor('public')" label="Go to Account" trailing-icon="i-heroicons-arrow-right-20-solid" />
            </div>
          </div>
          <USeparator
            v-if="isDesktop && !isPublicLoggedIn" orientation="vertical" label="or" class="h-24" 
          />
          <USeparator
            v-if="isDesktop && isPublicLoggedIn" label="or"
          />
          <div class="rf-login-card">
            <div v-if="!isAgentLoggedIn" class="card-icon">
              <UIcon name="i-heroicons-paint-brush-solid" class="size-8" />
            </div>
            <div v-if="!isAgentLoggedIn" class="card-content">
              <h2>I'm an artist</h2>
              <UButton @click="handleLoginDoor('agent')" label="Log in with Auth0" icon="i-heroicons-key-20-solid" />
            </div>
            <div v-else class="w-full">
              <UButton block @click="handleWelcomeDoor('agent')" label="Go to Artist Dashboard" trailing-icon="i-heroicons-arrow-right-20-solid" />
            </div>
          </div>
        </div>
        <USeparator />
        <div>
          By signing in, you agree to our
          <span v-for="(page, index) in legalPages" :key="index">
            <NuxtLink external :href="page.to" target="_blank" class="text-primary-400 hover:underline">{{ page.name }}</NuxtLink>
            <span v-if="index < legalPages.length - 1"> and </span>
          </span>.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-login-card {
  @apply flex items-center gap-6 bg-muted/25 w-full rounded-xl p-6;
  .frontier-content { @apply flex flex-col gap-4 items-start; }
  .welcome-content {
    @apply text-center flex flex-col items-center gap-4;
    .welcome-header {
      @apply flex items-center gap-2;
    }
  }
  .card-content {
    @apply flex flex-col gap-4 items-start;
  }
  .card-icon {
    @apply inline-flex text-primary-400 bg-neutral-950/50 p-4 rounded-full;
  }
}

h1 {
  @apply text-3xl font-bold;
}
h2 {
  @apply text-2xl font-bold;
}
</style>