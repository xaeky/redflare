<script setup lang="ts">
import { avatarBasesQuery } from '~/queries/commissions';

// Props
const props = defineProps<{
  base: DeserializedAvatarBase 
}>();

// Emits
const emit = defineEmits<{
  (e: 'edit', value: DeserializedAvatarBase): void
}>();

// Misc vars
const queryCache = useQueryCache();
const toast = useToast();

// Mutations
const { mutate:deleteBase, isLoading:deleteBaseBusy  } = useMutation({
  mutation: () => useAPI(`/api/commissions/bases/${props.base._id}`, { method: 'DELETE' }),
  onSuccess() {
    queryCache.invalidateQueries(avatarBasesQuery);
    toast.add({
      icon: 'i-lucide-check',
      description: 'Base deleted.'
    })
  }
})
</script>

<template>
  <li class="p-4 bg-neutral-800/50 rounded-xl space-y-2 select-none">
    <div class="flex items-center gap-4">
      <span v-text="base.name" class="text-2xl font-bold" />
      <ULink v-if="base.storefront_url" external target="_blank" :to="base.storefront_url">
        <UButton size="sm" label="View in store" color="neutral" variant="soft" icon="i-lucide-external-link" />
      </ULink>
    </div>
    <div>by {{ base.creator_name }}</div>
    <div class="flex justify-between items-center">
      <span v-text="base._id" class="font-mono text-xs select-all" />
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-trash-2" variant="soft" color="error" size="xl" @click="() => { deleteBase() }" :loading="deleteBaseBusy" :disable="deleteBaseBusy" />
        <UButton label="Edit base" icon="i-lucide-pencil" variant="soft" :disable="deleteBaseBusy" @click="emit('edit', base)" />
      </div>
    </div>
  </li>
</template>