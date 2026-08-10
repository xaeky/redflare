<script setup lang="ts">
definePageMeta({
  title: 'Welcome back'
});

// Get agreement URLs from Redflare config
const { config } = useRedflarePublicConfig();
const legalConfig = config.value?.legal as RedflareConfigLegal;

// Check if app has legal pages configured
const appHasConfiguredAgreements = computed(() => {
  if (!legalConfig) return false;
  return !!(legalConfig.termsOfServiceUrl?.length && legalConfig.privacyPolicyUrl?.length);
});

const legalAgreements = [
  { name: 'Terms of Service', to: legalConfig?.termsOfServiceUrl },
  { name: 'Privacy Policy', to: legalConfig?.privacyPolicyUrl }
];

const agentSession = useUserSession();
const isAgentLoggedIn = computed(() => agentSession.loggedIn.value);

const publicSession = usePublicUserSession();
const isPublicLoggedIn = computed(() => publicSession.isLoggedIn.value);

const handleLoginDoor = (type: 'public') => {
  const loginUrls = {
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

const { authenticate } = useWebAuthn({
  authenticateEndpoint: '/api/auth/passkey/attempt'
});

const handlePasskeyLogin = async () => {
  try {
    await authenticate();
    await agentSession.fetch();
    navigateTo('/dashboard', { external: true });
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: (error as any).data?.statusText || (error as any).data?.message || 'An error occurred during passkey authentication.',
      color: 'error'
    });
  }
}

// Agent login: either the app hasn't been set up yet (no accounts), or show a
// plain username/password form for the native auth system.
const { data: setupStatus } = await useAsyncData('agent-setup-status', () => useAPI<{ locked: boolean }>('/api/auth/setup/status'));
const isSetupLocked = computed(() => setupStatus.value?.locked ?? true);

const agentLoginState = reactive({ username: '', password: '' });
const agentLoginBusy = ref(false);
const agentLoginError = ref('');

const handleAgentLogin = async () => {
  agentLoginBusy.value = true;
  agentLoginError.value = '';
  try {
    await useAPI('/api/auth/login', { method: 'POST', body: agentLoginState });
    await agentSession.fetch();
    navigateTo('/dashboard');
  } catch (error) {
    agentLoginError.value = (error as any).data?.statusText || (error as any).data?.message || 'Invalid credentials.';
  } finally {
    agentLoginBusy.value = false;
  }
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
            <div v-if="!isAgentLoggedIn && isSetupLocked" class="card-content">
              <h2>I'm an artist</h2>
              <form class="flex flex-col gap-2 w-full" @submit.prevent="handleAgentLogin">
                <UInput v-model="agentLoginState.username" placeholder="Username" autocomplete="username" />
                <UInput v-model="agentLoginState.password" type="password" placeholder="Password" autocomplete="current-password" />
                <p v-if="agentLoginError" class="text-error text-sm">{{ agentLoginError }}</p>
                <UButton type="submit" :loading="agentLoginBusy" label="Log in" icon="i-heroicons-key-20-solid" block />
              </form>
              <form @submit.prevent="handlePasskeyLogin">
                <UButton type="submit" label="Log in with Passkey" icon="i-heroicons-finger-print-solid" block />
              </form>
            </div>
            <div v-else-if="!isAgentLoggedIn && !isSetupLocked" class="card-content">
              <h2>Welcome to Redflare</h2>
              <p>This instance hasn't been set up yet.</p>
              <UButton to="/setup" label="Set up this instance" icon="i-heroicons-sparkles-solid" />
            </div>
            <div v-else class="w-full">
              <UButton block @click="handleWelcomeDoor('agent')" label="Go to Artist Dashboard" trailing-icon="i-heroicons-arrow-right-20-solid" />
            </div>
          </div>
        </div>
        <USeparator v-if="appHasConfiguredAgreements" />
        <div v-if="appHasConfiguredAgreements">
          By signing in, you agree to our
          <span v-for="(page, index) in legalAgreements" :key="index">
            <ULink external :to="page.to" target="_blank" class="text-primary-400 hover:underline">{{ page.name }}</ULink>
            <span v-if="index < legalAgreements.length - 1"> and </span>
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