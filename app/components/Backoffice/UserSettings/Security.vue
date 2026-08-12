<script setup lang="ts">
import { BackofficeUserSettingsModalPasskeyDetails } from '#components';
import { useAccountPasskeyCredentialsMutation } from '~/mutations/accounts';

const {
  data: passkeysData,
  isPending: passkeysPending,
  safeDelete: passkeySafeDelete,
  formRegisterSchema: passkeyRegisterSchema,
  formRegisterState: passkeyRegisterState,
  mutateRegister: passkeyRegister,
} = useAccountPasskeyCredentialsMutation();

const meSecurityUpdatePasswordState = reactive({
  oldPassword: '',
  newPassword: '',
});

const meSecurityUpdatePassword = async () => {
  try {
    await useAPI('/api/me/shadow', {
      method: 'PUT',
      body: {
        oldPassword: meSecurityUpdatePasswordState.oldPassword,
        newPassword: meSecurityUpdatePasswordState.newPassword,
      },
    });
    invokeSuccessToast({
      description: 'Your password has been updated successfully.',
    });
  } catch (error) {
    invokeErrorToast({
      description:
        (error as any).data.message ||
        'An error occurred while updating your password.',
    });
  }
};

const isMobile = useMediaQuery('(max-width: 640px)');

const overlay = useOverlay();

const openPasskeyDetails = (passkey: AgentAccountPasskeyCredential) => {
  const passkeyDetailsModal = overlay.create(
    BackofficeUserSettingsModalPasskeyDetails,
    { destroyOnClose: true },
  );
  passkeyDetailsModal.open({
    passkey,
    overlay: passkeyDetailsModal,
    onDelete: (credentialId: string) => passkeySafeDelete(credentialId),
  });
};
</script>

<template>
  <div class="space-y-4">
    <div>
      <UForm
        :state="meSecurityUpdatePasswordState"
        class="space-y-4"
        @submit="meSecurityUpdatePassword"
        v-slot="{ loading }"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <UFormField label="Current Password" class="w-full" required>
            <UInput
              type="password"
              required
              placeholder="Enter current password"
              v-model="meSecurityUpdatePasswordState.oldPassword"
              class="w-full"
            />
          </UFormField>
          <UFormField label="New Password" class="w-full" required>
            <UInput
              type="password"
              required
              placeholder="Enter new password"
              v-model="meSecurityUpdatePasswordState.newPassword"
              class="w-full"
            />
          </UFormField>
        </div>
        <div>
          <UButton
            icon="i-heroicons-pencil-16-solid"
            label="Update password"
            type="submit"
            :loading
            :block="isMobile"
          />
        </div>
      </UForm>
    </div>
    <USeparator />
    <div class="space-y-2">
      <h3>Passkeys</h3>
      <div v-if="passkeysPending">Loading passkeys...</div>
      <div v-else class="space-y-2">
        <div class="border border-muted p-4 rounded-lg space-y-2">
          <h4>Add New Passkey</h4>
          <UForm
            :schema="passkeyRegisterSchema"
            :state="passkeyRegisterState"
            @submit="() => passkeyRegister()"
            class="space-y-2"
          >
            <UFormField required label="Passkey Alias" name="alias">
              <UInput
                type="text"
                v-model="passkeyRegisterState.alias"
                class="w-full"
              />
            </UFormField>
            <UButton
              icon="i-heroicons-key-16-solid"
              label="Setup Passkey"
              type="submit"
              :block="isMobile"
            />
          </UForm>
        </div>
        <div v-if="passkeysData && passkeysData.length > 0">
          <div class="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              v-for="passkey in passkeysData"
              :key="passkey.id"
              @click="openPasskeyDetails(passkey)"
              class="registered_passkeycredential_item"
            >
              <div class="space-y-2 w-full">
                <div class="font-medium flex items-center gap-2">
                  <span v-text="passkey.alias" class="flex-1" />
                  <UIcon name="i-lucide-arrow-up-right" />
                </div>
                <div class="text-sm text-muted">
                  {{ useDateFormat(passkey.createdAt, 'MMM Do YYYY, HH:MM') }}
                </div>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="flex items-center gap-2 justify-center p-4">
          <UIcon
            name="i-heroicons-key-16-solid"
            class="text-muted"
            :size="20"
          />
          <span>No passkeys registered.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/global.css";

.registered_passkeycredential_item {
  @apply text-left bg-linear-to-t from-muted/50 hover:from-muted ring ring-muted/50 p-4 rounded-lg flex items-center justify-between cursor-pointer duration-100 ease-expo transition-all sm:active:scale-97;
}

h3 {
  @apply text-xl font-semibold;
}
h4 {
  @apply text-lg font-semibold;
}
</style>
