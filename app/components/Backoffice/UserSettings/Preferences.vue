<script setup lang="ts">
import _ from 'lodash';
import type { AgentUserSettings } from '~~/shared/types';

const { user, fetch: userFetch } = useUserSession();
const toast = useToast();

const clonedUserSettings = reactive<AgentUserSettings>(
  _.cloneDeep(user.value?.settings) as AgentUserSettings,
);

const meSettingUpdate = async () => {
  try {
    await useAPI('/api/admin/me/settings', {
      method: 'PUT',
      body: JSON.stringify(clonedUserSettings),
    });
    await userFetch();
  } catch (error) {
    toast.add({
      title: 'Error',
      description:
        (error as any).data.message ||
        'An error occurred while updating your settings.',
      color: 'error',
    });
  }
};
</script>

<template>
  <div class="space-y-4" v-if="clonedUserSettings">
    <UAlert
      color="neutral"
      variant="outline"
      title="Session-based settings"
      icon="i-heroicons-clock-16-solid"
    >
      <template #description>
        These settings are saved for your user account and will persist across
        sessions.
      </template>
    </UAlert>
    <div class="space-y-4">
      <h3 class="text-lg font-medium mb-2">Commission Details</h3>
      <div class="space-y-4">
        <UFormField>
          <USwitch
            name="setting.forceAgentView"
            label="Force view as owner in commission detail pages."
            v-model="clonedUserSettings.forceAgentView"
            @change="() => meSettingUpdate()"
          />
        </UFormField>
      </div>
    </div>
  </div>
</template>
