<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { useGeneralConfigMutation } from '~/mutations/config';

const formRef = ref<ComponentExposed<typeof UForm>>();

const { formState, schema, submit, busy } = useGeneralConfigMutation(
  formRef as Ref<ComponentExposed<typeof UForm>>,
)();
</script>

<template>
  <BackofficeAppSettingsFormBox
    title="General"
    icon="i-heroicons-cog-6-tooth-solid"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formState"
      class="space-y-4"
      :disabled="busy"
    >
      <div>
        <USwitch
          v-model="formState.maintenanceMode"
          label="Maintenance mode"
          description="Prevent public users from accessing the application while you perform maintenance tasks."
        />
      </div>
    </UForm>
    <template #footer>
      <UButton @click="submit" :loading="busy" label="Save changes" />
    </template>
  </BackofficeAppSettingsFormBox>
</template>
