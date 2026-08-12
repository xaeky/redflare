import _ from 'lodash';
import { defineStore } from 'pinia';
import type z from 'zod';
import { avatarBasesQuery } from '~/queries/commissions';

const schema = avatarBaseOptionsSchema;
type Schema = z.output<typeof schema>;
type AdditionalState = {
  id: string | null;
};
const defaultState = (): Schema => ({
  name: '',
  creator_name: '',
  storefront_url: '',
  flags: 0,
});
const defaultAdditionalState = (): AdditionalState => ({
  id: null,
});

export const useAvatarBaseFormStore = defineStore('avatarBaseForm', () => {
  const errors = ref<Record<string, string>>({});
  const busy = ref(false);
  const formState = reactive<Schema>(defaultState());
  const additionalState = reactive<AdditionalState>(defaultAdditionalState());
  const initialState = ref<Schema>(defaultState());
  const queryCache = useQueryCache();

  function snapshot() {
    initialState.value = _.cloneDeep(formState);
  }

  const isModified = computed(() => !_.isEqual(formState, initialState.value));

  function reset() {
    _.assign(formState, defaultState());
    _.assign(additionalState, defaultAdditionalState());
    snapshot();
  }

  function clear() {
    _.assign(formState, defaultState());
    _.assign(additionalState, defaultAdditionalState());
    snapshot();
    queryCache.invalidateQueries(avatarBasesQuery);
    useOverlay().closeAll();
  }

  const { mutate: update, isLoading: updateBusy } = useMutation({
    mutation: () =>
      useAPI(`/api/commissions/bases/${additionalState.id}`, {
        method: 'PUT',
        body: formState,
      }),
    onSuccess() {
      clear();
    },
  });

  const { mutate: destroy, isLoading: destroyBusy } = useMutation({
    mutation: (baseId: string) =>
      useAPI(`/api/commissions/bases/${baseId}`, { method: 'DELETE' }),
    onSuccess() {
      clear();
    },
  });

  const { mutate: insert, isLoading: insertBusy } = useMutation({
    mutation: () =>
      useAPI(`/api/commissions/bases`, { method: 'POST', body: formState }),
    onSuccess() {
      clear();
    },
  });

  function safeDestroy(baseId: string) {
    useConfirmationModal({
      title: 'Are you sure you want to delete this avatar base?',
      message:
        'This action can break commissions that are using this base. This action cannot be undone.',
      confirmLabel: 'Delete base',
      danger: true,
      onConfirm: () => {
        destroy(baseId);
      },
    }).open();
  }

  return {
    reset,
    snapshot,
    isModified,
    update,
    updateBusy,
    destroy,
    safeDestroy,
    destroyBusy,
    insert,
    insertBusy,
    schema,
    formState,
    additionalState,
    errors,
    busy,
  };
});
