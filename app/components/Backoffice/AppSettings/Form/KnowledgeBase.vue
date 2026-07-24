<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { useKnowledgeBaseConfigMutation } from '~/mutations/config';

const formRef = ref<ComponentExposed<typeof UForm>>();

const { formState, schema, submit, busy } = useKnowledgeBaseConfigMutation(formRef as Ref<ComponentExposed<typeof UForm>>)();
</script>

<template>
  <BackofficeAppSettingsFormBox title="Knowledge Base" icon="i-heroicons-book-open-solid">
    <UForm ref="formRef" :schema :state="formState" class="space-y-4" :disabled="busy">
      <UFormField name="helpLinks.howToUploadAvatarUrl" label="URL to 'How to upload private avatar'">
        <UInput v-model="(formState.helpLinks.howToUploadAvatarUrl as string)" placeholder="https://path.to/guide" />
      </UFormField>
    </UForm>
    <template #footer>
      <UButton @click="submit" :loading="busy" label="Save changes" />
    </template>
  </BackofficeAppSettingsFormBox>
</template>