import { defineStore } from 'pinia';
import _ from 'lodash';
import z from 'zod';
import { CommissionStatusType } from '~~/shared/enums/Commissions';

function toUpdateData(remoteData: CommissionBaseRaw): CommissionUpdate {
  const rawClone = _.cloneDeep(remoteData);
  const localData: CommissionUpdate = {
    ...rawClone,
    created_at: new Date(rawClone.created_at),
    characters: rawClone.characters.map(c => ({
      name: c.name,
      base: c.base._id.toString(), // Ensure base is an ID
      note: c.note,
      changelog: c.changelog,
    })) as CommissionCharacterOptions[],
    payments: rawClone.payments.map(p => p.toString()),
  };
  return localData;
}

const schema = commissionUpdateSchema;
type Schema = z.output<typeof schema>;
type AdditionalState = {
  id: string | null;
  customer: Partial<CustomerRaw> | null;
  attachments: Record<string, CommissionCharacterAttachmentRaw>;
}

const defaultState = (): Schema => ({
  customer: '',
  public_note: '',
  secure_note: '',
  status: CommissionStatusType.InSetup,
  characters: [],
  payments: [],
  created_at: new Date()
});

const defaultAdditionalState = (): AdditionalState => ({
  id: null,
  customer: {},
  attachments: {}
})

export const useCommissionFormStore = defineStore('commissionForm', () => {
  const toast = useToast();
  const errors = ref<Record<string, string>>({});
  const busy = ref(false);
  const formState = reactive<Schema>(defaultState());
  const additionalState = reactive<AdditionalState>(defaultAdditionalState());

  function reset() {
    _.assign(formState, defaultState());
    _.assign(additionalState, defaultAdditionalState());
  }

  function addAttachmentMetadata(attachmentId: string, metadata: CommissionCharacterAttachmentRaw) {
    additionalState.attachments[attachmentId] = metadata;
  }

  function removeAttachmentMetadata(attachmentId: string) {
    delete additionalState.attachments[attachmentId];
  }

  async function fetch(commissionId: string) {
    if (!commissionId) {
      busy.value = false;
      reset();
      return;
    }
    try {
      busy.value = true;
      additionalState.id = commissionId;
      const response = await useAPI<SingleCommissionResponse>(`/api/commissions/${commissionId}`);
      const localData = toUpdateData(response.data);
      _.assign(formState, _.pick(localData, Object.keys(schema.shape)));
      _.assign(additionalState, {
        attachments: response.attachments || {},
        customer: response.customer || null
      });
      errors.value = {};
    } catch (error: any) {
      toast.add({
        color: 'error',
        description: errors.value.general,
        duration: 5000
      });
    }
    busy.value = false;
  };

  return { formState, additionalState, addAttachmentMetadata, removeAttachmentMetadata, schema, reset, errors, fetch, busy };
});