<script setup lang="ts">
import type { User } from '#auth-utils';

const { user, fetch: userFetch } = useUserSession();
const toast = useToast();

definePageMeta({
  title: 'User Settings',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});

const meProfileUpdateState = reactive({
  nickname: '',
  picture: ''
});

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

const meProfileUpdate = async () => {
  try {
    await useAPI('/api/me', {
      method: 'PUT',
      body: {
        nickname: meProfileUpdateState.nickname,
        picture: meProfileUpdateState.picture
      }
    });
    toast.add({
      title: 'Success',
      description: 'Your profile has been updated successfully.',
      color: 'success'
    });
    await userFetch();
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as any).data.message || 'An error occurred while updating your profile.',
      color: 'error'
    });
  }
};

onMounted(() => {
  if (user.value) {
    meProfileUpdateState.nickname = user.value.nickname || '';
    meProfileUpdateState.picture = user.value.picture || '';
  }
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
        <UForm :state="meProfileUpdateState" @submit="meProfileUpdate" class="space-y-4" v-slot="{ loading }">
          <UFormField label="Nickname">
            <UInput type="text" name="username" v-model="meProfileUpdateState.nickname" class="w-full" />
          </UFormField>
          <UFormField label="Profile Picture URL">
            <UInput type="url" name="picture" v-model="meProfileUpdateState.picture" class="w-full" />
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
</style>