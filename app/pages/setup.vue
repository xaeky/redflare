<script setup lang="ts">
import { SecurityTurnstileWidget } from '#components';
import { z } from 'zod';

const { data: setupStatus } = await useAsyncData('setup-page-status', () => useAPI<{ locked: boolean }>('/api/auth/setup'));
if (setupStatus.value?.locked) {
  await navigateTo('/', { replace: true });
}

const turnstileWidgetRef = ref<InstanceType<typeof SecurityTurnstileWidget> | null>(null);

const formSchema = agentAccountSetupSchema;
const formState = reactive({
  setupToken: '',
  username: '',
  password: '',
  confirmPassword: '',
  displayName: ''
});
const turnstileToken = ref('');

const busy = ref(false);
const errorMessage = ref('');

const handleTurnstileVerified = (token: string) => {
  turnstileToken.value = token;
};

const handleSetupSubmit = async () => {
  errorMessage.value = '';
  if (formState.password !== formState.confirmPassword) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }
  busy.value = true;
  try {
    await useAPI('/api/auth/setup', {
      method: 'POST',
      body: {
        setupToken: formState.setupToken,
        username: formState.username,
        password: formState.password,
        displayName: formState.displayName || undefined,
        turnstileToken: turnstileToken.value
      }
    });
    const agentSession = useUserSession();
    await agentSession.fetch();
    await navigateTo('/dashboard', { replace: true });
  } catch (error) {
    errorMessage.value = (error as any).data?.statusText || (error as any).data?.message || 'Failed to set up this instance.';
    turnstileWidgetRef.value?.resetWidget();
  } finally {
    busy.value = false;
  }
}

definePageMeta({
  title: 'Set up Redflare'
});
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center space-y-4 max-w-sm w-full">
      <div class="py-2 mx-auto">
        <HeaderLogo size="lg" />
      </div>
      <div>
        <h1>Set up Redflare</h1>
        <p>Create the first artist account. This can only be done once.</p>
      </div>
      <UForm :schema="formSchema" :state="formState" class="flex flex-col gap-3 text-left" @submit.prevent="handleSetupSubmit">
        <UFormField label="Setup token" name="setupToken" required>
          <UInput v-model="formState.setupToken" class="w-full" />
        </UFormField>
        <UFormField label="Username" name="username" required>
          <UInput v-model="formState.username" class="w-full" />
        </UFormField>
        <UFormField label="Display name (optional)" name="displayName">
          <UInput v-model="formState.displayName" class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password" required>
          <UInput v-model="formState.password" type="password" class="w-full" />
        </UFormField>
        <UFormField label="Confirm password" name="confirmPassword" required>
          <UInput v-model="formState.confirmPassword" type="password" class="w-full" />
        </UFormField>
        <div class="flex justify-center">
          <SecurityTurnstileWidget ref="turnstileWidgetRef" @verified="handleTurnstileVerified" />
        </div>
        <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>
        <UButton type="submit" :loading="busy" label="Create account" block />
      </UForm>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

h1 {
  @apply text-3xl font-bold;
}
</style>