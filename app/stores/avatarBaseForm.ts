import { defineStore } from 'pinia';
import _ from 'lodash';
import z from 'zod';
import { avatarBasesQuery } from '~/queries/commissions';

const schema = avatarBaseOptionsSchema;
type Schema = z.output<typeof schema>;
type AdditionalState = {
  id: string | null;
}
const defaultState = (): Schema => ({
  name: '',
  creator_name: '',
  storefront_url: '',
  blacklisted: false
});
const defaultAdditionalState = (): AdditionalState => ({
  id: null
});

export const useAvatarBaseFormStore = defineStore('avatarBaseForm', () => {
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

  function clear() {
    _.assign(formState, defaultState());
    _.assign(additionalState, defaultAdditionalState());
    queryCache.invalidateQueries(avatarBasesQuery);
    useOverlay().closeAll();
  }

  const { mutate: update, isLoading: updateBusy } = useMutation({
    mutation: () => useAPI(`/api/commissions/bases/${additionalState.id}`, { method: 'PUT', body: formState }),
    onSuccess() {
      clear();
    }
  });

  const { mutate: destroy, isLoading: destroyBusy } = useMutation({
    mutation: (baseId: string) => useAPI(`/api/commissions/bases/${baseId}`, { method: 'DELETE' }),
    onSuccess() {
      clear();
    }
  });

  const { mutate: insert, isLoading: insertBusy } = useMutation({
    mutation: () => useAPI(`/api/commissions/bases`, { method: 'POST', body: formState }),
    onSuccess() {
      clear();
    }
  });

  function safeDestroy(baseId: string) {
    useConfirmationModal({
      title: 'Are you sure you want to delete this avatar base?',
      message: 'This action can break commissions that are using this base. This action cannot be undone.',
      confirmLabel: 'Delete base',
      danger: true,
      onConfirm: () => {
        destroy(baseId);
      }
    }).open();
  }

  return { reset, update, updateBusy, destroy, safeDestroy, destroyBusy, insert, insertBusy, schema, formState, additionalState, errors, busy }
});