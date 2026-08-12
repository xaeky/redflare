<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';
import { z } from 'zod';
import { UForm } from '#components';

const props = defineProps<{
  intentionToken: string;
}>();

const emit = defineEmits<{
  (e: 'confirmed'): void;
  (e: 'cancelled'): void;
}>();

const wasConfirmed = ref(false);
const thisFormRef = ref<ComponentExposed<typeof UForm>>();
const passwordBusy = ref(false);
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required')
});
const passwordState = reactive({
  password: ''
});

const handleConfirmation = async () => {
  passwordBusy.value = true;
  try {
    await thisFormRef.value?.validate({});
    await useAPI(`/api/admin/confirmation/${props.intentionToken}`, {
      method: 'POST',
      body: { password: passwordState.password }
    });
    wasConfirmed.value = true;
    emit('confirmed');
  } catch (error) {
    invokeErrorToast({ description: (error as any).data.message || 'An error occurred while confirming your password.' })
  }
  passwordBusy.value = false;
}

const isMobile = useMediaQuery('(max-width: 640px)');

onBeforeUnmount(() => {
  if (!wasConfirmed.value) emit('cancelled');
});
</script>

<template>
  <UModal title="This action requires confirmation" :dismissible="false">
    <template #body>
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="flex p-4 rounded-full bg-muted/50">
          <UIcon name="i-lucide-key" class="w-6 h-6 text-muted" />
        </div>
        <div class="space-y-4 flex-1">
          <p>Please enter your current password to confirm this action.</p>
          <UForm ref="thisFormRef" :state="passwordState" :schema="passwordSchema" class="space-y-4">
            <UFormField label="Current Password" class="w-full" required>
              <UInput type="password" required placeholder="Enter current password" v-model="passwordState.password" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 justify-end w-full">
        <UButton color="primary" label="Confirm" :loading="passwordBusy" @click="handleConfirmation" :block="isMobile" />
      </div>
    </template>
  </UModal>
</template>