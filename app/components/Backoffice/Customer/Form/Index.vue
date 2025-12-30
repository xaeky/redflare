<script setup lang="ts">
const customerFormStore = useCustomerFormStore();
</script>

<template>
  <UForm :schema="customerFormStore.schema" :state="customerFormStore.formState" class="space-y-4">
    <UFormField name="name" label="Name" required>
      <UInput label="Name" v-model="customerFormStore.formState.name" class="w-full" />
    </UFormField>
    <UFormField name="vrc_id" label="VRChat User ID">
      <UInput label="VRChat User ID" v-model="customerFormStore.formState.vrc_id" class="w-full" />
    </UFormField>
    <UFormField name="telegram_id" label="Telegram ID">
      <UInput label="Telegram ID" v-model="customerFormStore.formState.telegram_id" class="w-full" />
    </UFormField>
    <UFormField name="discord_id" label="Discord ID">
      <UInput label="Discord ID" v-model="customerFormStore.formState.discord_id" class="w-full" />
    </UFormField>
    <UFormField name="note" label="Note">
      <UInput label="Note" v-model="customerFormStore.formState.note" class="w-full" />
    </UFormField>
  </UForm>
</template>