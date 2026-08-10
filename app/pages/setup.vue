<script setup lang="ts">
definePageMeta({
  title: 'Set up Redflare'
});

const { data: setupStatus } = await useAsyncData('setup-page-status', () => useAPI<{ locked: boolean }>('/api/auth/setup/status'));
if (setupStatus.value?.locked) {
  await navigateTo('/', { replace: true });
}

const formState = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  displayName: ''
});

const busy = ref(false);
const errorMessage = ref('');

const submit = async () => {
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
        username: formState.username,
        password: formState.password,
        displayName: formState.displayName || undefined
      }
    });
    const agentSession = useUserSession();
    await agentSession.fetch();
    await navigateTo('/dashboard', { replace: true });
  } catch (error) {
    errorMessage.value = (error as any).data?.statusText || (error as any).data?.message || 'Failed to set up this instance.';
  } finally {
    busy.value = false;
  }
}
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
      <form class="flex flex-col gap-3 text-left" @submit.prevent="submit">
        <UFormField label="Username">
          <UInput v-model="formState.username" autocomplete="username" class="w-full" />
        </UFormField>
        <UFormField label="Display name (optional)">
          <UInput v-model="formState.displayName" class="w-full" />
        </UFormField>
        <UFormField label="Password">
          <UInput v-model="formState.password" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>
        <UFormField label="Confirm password">
          <UInput v-model="formState.confirmPassword" type="password" autocomplete="new-password" class="w-full" />
        </UFormField>
        <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>
        <UButton type="submit" :loading="busy" label="Create account" block />
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

h1 {
  @apply text-3xl font-bold;
}
</style>