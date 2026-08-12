<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { useLegalConfigMutation } from '~/mutations/config';

const formRef = ref<ComponentExposed<typeof UForm>>();

const { formState, schema, submit, busy } = useLegalConfigMutation(
  formRef as Ref<ComponentExposed<typeof UForm>>,
)();
</script>

<template>
  <BackofficeAppSettingsFormBox
    title="Legal"
    icon="i-heroicons-document-text-solid"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formState"
      class="space-y-4"
      :disabled="busy"
    >
      <UFormField name="privacyPolicyUrl" label="Privacy Policy URL">
        <UInput
          v-model="(formState.privacyPolicyUrl as string)"
          placeholder="https://link.to/privacy-policy"
        />
      </UFormField>
      <UFormField name="termsOfServiceUrl" label="Terms of Service URL">
        <UInput
          v-model="(formState.termsOfServiceUrl as string)"
          placeholder="https://link.to/terms-of-service"
        />
      </UFormField>
    </UForm>
    <template #footer>
      <UButton @click="submit" :loading="busy" label="Save changes" />
    </template>
  </BackofficeAppSettingsFormBox>
</template>
