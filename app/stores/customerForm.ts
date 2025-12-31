import { defineStore } from 'pinia';
import _ from 'lodash';
import z from 'zod';

const schema = customerOptionsSchema;
type Schema = z.output<typeof customerOptionsSchema>;
type AdditionalState = {
  id: string | null;
}
const defaultState = (): Schema => ({
  name: '',
  vrc_id: '',
  note: '',
  telegram_id: '',
  discord_id: ''
});
const defaultAdditionalState = (): AdditionalState => ({
  id: null
})

export const useCustomerFormStore = defineStore('customerForm', () => {
  const toast = useToast();
  const errors = ref<Record<string, string>>({});
  const busy = ref(false);
  const formState = reactive<Schema>(defaultState());
  const additionalState = reactive<AdditionalState>(defaultAdditionalState());
  const queryCache = useQueryCache();

  function reset() {
    _.assign(formState, defaultState());
    _.assign(additionalState, defaultAdditionalState());
  }

  const { mutate: update, isLoading: updateBusy } = useMutation({
    mutation: () => useAPI(`/api/customers/${additionalState.id}`, {
      method: 'PUT',
      body: _.mapValues(formState, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
    }),
    async onSuccess() { 
      await queryCache.invalidateQueries({ key: ['customers'] });
      useOverlay().closeAll();
      toast.add({ description: 'Customer saved.' });
    }
  });

  const { mutate: insert, isLoading: insertBusy } = useMutation({
    mutation: () => useAPI(`/api/customers`, {
      method: 'POST',
      body: _.mapValues(formState, v => (typeof v === 'string' && v?.trim()) === '' ? null : v)
    }),
    async onSuccess() { 
      await queryCache.invalidateQueries({ key: ['customers'] });
      useOverlay().closeAll();
      toast.add({ description: 'Customer created.' });
    }
  });

  const { mutate: destroy, isLoading: destroyBusy } = useMutation({
    mutation: (id: string) => useAPI(`/api/customers/${id}`, { method: 'DELETE' }),
    onSuccess() {
      queryCache.invalidateQueries({ key: ['customers'] });
      useOverlay().closeAll();
      toast.add({ description: 'Customer deleted.' });
    }
  });

  const safeDestroy = (id: string) => {
    useConfirmationModal({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => destroy(id)
    }).open();
  }

  async function fetch(customerId: string) {
    if (!customerId) {
      reset();
      return;
    }
    try {
      busy.value = true;
      additionalState.id = customerId;
      const customer = await $fetch<Schema>(`/api/customers/${customerId}`);
      _.assign(formState, customer);
    } catch (e: any) {
      toast.add({
        color: 'error',
        description: 'Failed to load customer data.',
        duration: 5000
      });
    } finally {
      busy.value = false;
    }
  }

  return { errors, busy, updateBusy, insertBusy, destroyBusy, fetch, update, insert, destroy, safeDestroy, reset, schema, formState, additionalState };
});