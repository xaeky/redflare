<script setup lang="ts">
const avatarBaseFormStore = useAvatarBaseFormStore();
</script>

<template>
  <UForm :schema="avatarBaseFormStore.schema" :state="avatarBaseFormStore.formState" class="space-y-4">
    <UFormField name="name" label="Name">
      <UInput v-model="avatarBaseFormStore.formState.name" class="w-full" />
    </UFormField>
    <UFormField name="creator_name" label="Creator name">
      <UInput v-model="avatarBaseFormStore.formState.creator_name" class="w-full" />
    </UFormField>
    <UFormField name="storefront_url" label="Storefront URL">
      <UInput v-model="avatarBaseFormStore.formState.storefront_url" class="w-full" />
    </UFormField>
    <UFormField name="blacklisted">
      <USwitch v-model="avatarBaseFormStore.formState.blacklisted" label="Blacklisted" />
      <UAlert color="neutral" variant="soft" class="mt-2" v-if="avatarBaseFormStore.formState.blacklisted" icon="i-heroicons-information-circle-16-solid">
        <template #description>
          Marking an avatar base as blacklisted will exclude it from being displayed in the Public API.
        </template>
      </UAlert>
    </UFormField>
  </UForm>
</template>