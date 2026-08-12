<script setup lang="ts">
import { useAccountProfileMutation } from '~/mutations/accounts';

const {
  formSchema: meProfileFormSchema,
  formState: meProfileFormState,
  mutate: meProfileMutate,
} = useAccountProfileMutation();

const isMobile = useMediaQuery('(max-width: 640px)');
</script>

<template>
  <div class="space-y-4">
    <UForm
      :schema="meProfileFormSchema"
      :state="meProfileFormState"
      @submit="() => meProfileMutate()"
      class="space-y-4"
      v-slot="{ loading }"
    >
      <UFormField label="Username" name="username" required>
        <UInput
          type="text"
          v-model="(meProfileFormState.username as string)"
          required
          class="w-full"
        />
      </UFormField>
      <UFormField label="Display name" name="displayName">
        <UInput
          type="text"
          v-model="(meProfileFormState.displayName as string)"
          class="w-full"
        />
      </UFormField>
      <div>
        <UButton
          icon="i-heroicons-pencil-16-solid"
          label="Update profile"
          type="submit"
          :loading
          :block="isMobile"
        />
      </div>
    </UForm>
  </div>
</template>
