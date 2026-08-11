<script setup lang="ts">
const agentSession = useUserSession();
const isAgentLoggedIn = computed(() => agentSession.loggedIn.value);

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

const handleAgentLogout = async () => {
  agentSession.clear();
  invokeInfoToast({
    title: 'You\'ve been logged out as an artist',
  })
}

const isMobile = useMediaQuery('(max-width: 640px)');
const artistName = computed(() => agentSession.user.value?.displayName || agentSession.user.value?.username || 'artist');
const authTitle = computed(() => isAgentLoggedIn.value ? `Welcome back, ${artistName.value}!` : 'Authenticate as an artist');

const emit = defineEmits<{
  'view-back': [];
}>();
</script>

<template>
  <div class="realm-discovery-view-container space-y-2">
    <div class="text-left">
      <UButton
        @click="emit('view-back')" label="Back" variant="subtle" icon="i-lucide-arrow-left" color="neutral"
        :block="isMobile" :size="isMobile ? 'lg' : 'sm'"
      />
    </div>
    <h2 v-text="authTitle" />
    <div v-if="!isAgentLoggedIn" class="space-y-2">
      <form class="space-y-2" @submit.prevent="handleAgentLogin">
        <UFormField label="Username" name="username">
          <UInput type="text" v-model="agentLoginState.username" required class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput type="password" v-model="agentLoginState.password" required class="w-full" />
        </UFormField>
        <div>
          <UButton
            :loading="agentLoginBusy" type="submit" block
            label="Login" size="xl"
          />
        </div>
        <p v-if="agentLoginError" class="text-error text-sm mt-1">{{ agentLoginError }}</p>
      </form>
      <USeparator label="or" />
      <div>
        <UButton
          @click="handlePasskeyLogin" label="Login with Passkey"
          variant="outline" icon="i-lucide-key" color="neutral" block size="xl"
        />
      </div>
    </div>
    <div v-else class="space-y-4">
      <UAvatar :alt="artistName" color="primary" size="3xl" />
      <p class="text-sm text-muted">You are already logged in as an artist.</p>
      <div class="flex flex-col gap-4">
        <ULink to="/dashboard">
          <UButton
            label="Go to Dashboard" color="primary" icon="i-lucide-arrow-right" size="xl" :block="isMobile"
          />
        </ULink>
        <div>
          <UButton
            @click="handleAgentLogout" label="Log out" color="neutral" variant="ghost" icon="i-lucide-log-out" size="md" :block="isMobile"
          />
        </div>
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
