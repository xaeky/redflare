<script setup lang="ts">
import _ from 'lodash';
import * as z from 'zod';
import { commissionsBasesQuery } from '~/queries/commissions';

// Props & vars
const queryCache = useQueryCache();
const props = defineProps<{
  open: boolean;
  base: CommissionBase;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// Inputs
const editBaseSlideoverOpen = computed({
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
const { mutate:updateCommissionBase, isLoading:updateCommissionBaseBusy } = useMutation({
  mutation: () => useAPI(`/api/commissions/bases/${props.base.id}`, { method: 'PUT', body: state }),
  onSuccess() {
    editBaseSlideoverOpen.value = false;
    _.assign(state, defaultState);
    queryCache.invalidateQueries(commissionsBasesQuery);
  }
});

// Watchers
watch(() => props.base, (newBaseData) => {
  const sanitizedBaseData = _.pick(newBaseData, Object.keys(defaultState)) as Schema;
  _.assign(state, sanitizedBaseData);
}, { immediate: true, deep: true })
</script>

<template>
  <USlideover v-model:open="editBaseSlideoverOpen" title="Edit commission base">
    <template #body>
      <UForm :schema :state class="space-y-4" @submit="() => { updateCommissionBase() }">
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
          <UButton type="submit" label="Save commission base" block :loading="updateCommissionBaseBusy" :disable="updateCommissionBaseBusy" />
        </div>
      </UForm>
    </template>
  </USlideover>
</template>