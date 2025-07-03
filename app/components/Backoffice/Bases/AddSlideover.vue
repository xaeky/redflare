<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionsBasesQuery } from '~/queries/commissions';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  open: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const addBaseSlideoverOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

// Form
const schema = commissionBaseOptionsSchema;
type Schema = z.output<typeof schema>;
const defaultState:Schema = {
  name: '',
  creator_name: '',
  storefront_url: ''
}
const state = reactive<Schema>(_.cloneDeep(defaultState));

// Mutations
const { mutate:addCommissionBase, isLoading:addCommissionBaseBusy } = useMutation({
  mutation: () => useAPI('/api/commissions/bases', { method: 'POST', body: state }),
  onSuccess() {
    addBaseSlideoverOpen.value = false;
    _.assign(state, defaultState);
    queryCache.invalidateQueries(commissionsBasesQuery);
  }
});
</script>

<template>
  <USlideover v-model:open="addBaseSlideoverOpen" title="Add commission base">
    <template #body>
      <UForm :schema :state class="space-y-4" @submit="() => { addCommissionBase() }">
        <UFormField name="name" label="Name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField name="creator_name" label="Creator name">
          <UInput v-model="state.creator_name" class="w-full" />
        </UFormField>
        <UFormField name="storefront_url" label="Storefront URL">
          <UInput v-model="state.storefront_url" class="w-full" />
        </UFormField>
        <div>
          <UButton type="submit" label="Save commission base" block :loading="addCommissionBaseBusy" :disable="addCommissionBaseBusy" />
        </div>
      </UForm>
    </template>
  </USlideover>
</template>