<script setup lang="ts">
import _ from 'lodash';
import type { AgentUserSettings } from '~~/shared/types';
import { useAccountPasskeyCredentialsMutation, useAccountProfileMutation } from '~/mutations/accounts';

const { user, fetch: userFetch } = useUserSession();
const toast = useToast();

const {
  data: passkeysData,
  isPending: passkeysPending,
  refetch: passkeysRefetch,
  safeDelete: passkeySafeDelete,
  formRegisterSchema: passkeyRegisterSchema,
  formRegisterState: passkeyRegisterState,
  mutateRegister: passkeyRegister
} = useAccountPasskeyCredentialsMutation();

const {
  formSchema: meProfileFormSchema,
  formState: meProfileFormState,
  mutate: meProfileMutate
} = useAccountProfileMutation();

const meSecurityUpdatePasswordState = reactive({
  oldPassword: '',
  newPassword: ''
});

const meSecurityUpdatePassword = async () => {
  try {
    await useAPI('/api/me/shadow', {
      method: 'PUT',
      body: {
        oldPassword: meSecurityUpdatePasswordState.oldPassword,
        newPassword: meSecurityUpdatePasswordState.newPassword
      }
    });
    toast.add({
      title: 'Success',
      description: 'Your password has been updated successfully.',
      color: 'success'
    });
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as any).data.message || 'An error occurred while updating your password.',
      color: 'error'
    });
  }
};

const meSettingUpdate = async () => {
  try {
    await useAPI('/api/me/settings', {
      method: 'PUT',
      body: JSON.stringify(clonedUserSettings)
    });
    toast.add({
      title: 'Success',
      description: 'Your settings have been updated successfully.',
      color: 'success'
    });
    await userFetch();
    await passkeysRefetch();
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as any).data.message || 'An error occurred while updating your settings.',
      color: 'error'
    });
  }
};

const clonedUserSettings = reactive<AgentUserSettings>(_.cloneDeep(user.value?.settings) as AgentUserSettings);

definePageMeta({
  title: 'User Settings',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <div class="rf-profile-sections">
      <div class="rf-profile-section">
        <div class="flex gap-2 items-center">
          <UIcon name="i-heroicons-user-16-solid" class="text-primary" :size="20" />
          <h2>Profile</h2>
        </div>
        <UForm :schema="meProfileFormSchema" :state="meProfileFormState" @submit="() => meProfileMutate()" class="space-y-4" v-slot="{ loading }">
          <UFormField label="Display name" name="displayName">
            <UInput type="text" v-model="(meProfileFormState.displayName as string)" class="w-full" />
          </UFormField>
          <div>
            <UButton icon="i-heroicons-pencil-16-solid" label="Update profile" type="submit" :loading />
          </div>
        </UForm>
      </div>
      <div class="rf-profile-section">
        <div class="flex gap-2 items-center">
          <UIcon name="i-heroicons-lock-closed-16-solid" class="text-primary" :size="20" />
          <h2>Security</h2>
        </div>
        <div>
          <UForm :state="meSecurityUpdatePasswordState" class="space-y-4" @submit="meSecurityUpdatePassword" v-slot="{ loading }">
            <div class="flex gap-4">
              <UFormField label="Current Password" class="w-full">
                <UInput type="password" placeholder="Enter current password" v-model="meSecurityUpdatePasswordState.oldPassword" class="w-full" />
              </UFormField>
              <UFormField label="New Password" class="w-full">
                <UInput type="password" placeholder="Enter new password" v-model="meSecurityUpdatePasswordState.newPassword" class="w-full" />
              </UFormField>
            </div>
            <div>
              <UButton icon="i-heroicons-pencil-16-solid" label="Update password" type="submit" :loading />
            </div>
          </UForm>
        </div>
        <div>
          <h3>Passkeys</h3>
          <div v-if="passkeysPending">Loading passkeys...</div>
          <div v-else class="space-y-2">
            <div v-if="passkeysData && passkeysData.length > 0">
              <ul class="space-y-2">
                <li v-for="passkey in passkeysData" :key="passkey.id" class="bg-neutral-900/50 p-4 rounded-lg flex items-center justify-between">
                  <div class="space-y-2">
                    <div class="font-medium">{{ passkey.alias }}</div>
                    <div class="text-sm text-muted">{{ useDateFormat(passkey.createdAt, 'MMM Do YYYY, HH:MM') }}</div>
                  </div>
                  <UButton icon="i-heroicons-trash-16-solid" label="Delete" @click="passkeySafeDelete(passkey.id)" />
                </li>
              </ul>
            </div>
            <div v-else class="flex items-center gap-2 justify-center p-4">
              <UIcon name="i-heroicons-key-16-solid" class="text-muted" :size="20" />
              <span>No passkeys registered.</span>
            </div>
            <div class="border border-muted p-4 rounded-lg space-y-2">
              <h4>Add New Passkey</h4>
              <UForm :schema="passkeyRegisterSchema" :state="passkeyRegisterState" @submit="() => passkeyRegister()" class="space-y-2">
                <UFormField required label="Passkey Alias" name="alias">
                  <UInput type="text" v-model="passkeyRegisterState.alias" class="w-full" />
                </UFormField>
                <UButton icon="i-heroicons-key-16-solid" label="Setup Passkey" type="submit" />
              </UForm>
            </div>
          </div>
        </div>
      </div>
      <div class="rf-profile-section" v-if="clonedUserSettings">
        <div class="flex gap-2 items-center">
          <UIcon name="i-heroicons-cog-16-solid" class="text-primary" :size="20" />
          <h2>Settings</h2>
        </div>
        <div>
          <UAlert color="neutral" variant="outline" title="Session-based settings" icon="i-heroicons-clock-16-solid" class="mb-4">
            <template #description>
              These settings are saved for your user account and will persist across sessions.
            </template>
          </UAlert>
        </div>
        <div class="space-y-4">
          <h3 class="text-lg font-medium mb-2">Commission Details</h3>
          <div class="space-y-4">
            <UFormField>
              <USwitch name="setting.forceAgentView" label="Force view as owner in commission detail pages."
              v-model="clonedUserSettings.forceAgentView" @change="() => meSettingUpdate()" />
            </UFormField>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-profile-sections {
  @apply grid grid-cols-2 gap-8 items-start;
}

.rf-profile-section {
  @apply bg-muted p-6 rounded-lg space-y-2;
}

h1 {
  @apply text-3xl font-bold;
}
h2 {
  @apply text-2xl font-bold;
}
h3 {
  @apply text-xl font-semibold;
}
h4 {
  @apply text-lg font-semibold;
}
</style>