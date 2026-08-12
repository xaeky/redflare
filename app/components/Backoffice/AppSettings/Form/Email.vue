<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { useEmailConfigMutation } from '~/mutations/config';

const formRef = ref<ComponentExposed<typeof UForm>>();

const { formState, schema, submit, busy } = useEmailConfigMutation(
  formRef as Ref<ComponentExposed<typeof UForm>>,
)();
</script>

<template>
  <BackofficeAppSettingsFormBox
    title="Contact Addresses"
    icon="i-heroicons-envelope-solid"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formState"
      class="space-y-4"
      :disabled="busy"
    >
      <UFormField name="contact.support" label="Support email">
        <UInput
          v-model="(formState.contact.support as string)"
          placeholder="support@example.com"
        />
      </UFormField>
      <UFormField name="contact.copyright" label="Copyright email">
        <UInput
          v-model="(formState.contact.copyright as string)"
          placeholder="copyright@example.com"
        />
      </UFormField>
      <UFormField name="contact.legal" label="Legal email">
        <UInput
          v-model="(formState.contact.legal as string)"
          placeholder="legal@example.com"
        />
      </UFormField>
    </UForm>
    <template #footer>
      <UButton @click="submit" :loading="busy" label="Save changes" />
    </template>
  </BackofficeAppSettingsFormBox>
</template>
