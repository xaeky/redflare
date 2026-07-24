<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { useGeneralConfigMutation } from '~/mutations/config';

const formRef = ref<ComponentExposed<typeof UForm>>();

const { formState, schema, submit, busy } = useGeneralConfigMutation(formRef as Ref<ComponentExposed<typeof UForm>>)();

definePageMeta({
  title: 'App Settings',
  description: 'Manage Redflare global settings.',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div>
    <h2>General</h2>
    <UForm ref="formRef" :schema="schema" :state="formState" class="space-y-4" @submit="submit" :disabled="busy">
      <div>
        <USwitch v-model="formState.maintenanceMode" label="Maintenance mode" />
      </div>
      <div>
        <UButton type="submit" :loading="busy" label="Save changes" />
      </div>
    </UForm>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

</style>