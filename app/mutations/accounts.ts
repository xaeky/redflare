import _ from 'lodash';
import type { z } from 'zod';
import {
  agentAccountPasskeyCredentialsListQuery,
  agentAccountProfileQuery,
} from '~/queries/accounts';

export const useAccountProfileMutation = defineMutation(() => {
  const { data, ...query } = useQuery(agentAccountProfileQuery);
  const formSchema = agentAccountProfilePutSchema;
  type FormSchemaOutput = z.output<typeof formSchema>;
  const formState = reactive<FormSchemaOutput>({
    displayName: '',
    username: '',
  });

  watch(
    data,
    (remote) => {
      if (!remote) return;
      _.assign(formState, _.pick(remote, Object.keys(formSchema.shape)));
    },
    { immediate: true },
  );

  const { mutate } = useMutation({
    mutation: () => useAPI('/api/me', { method: 'PUT', body: formState }),
    onSuccess: () => {
      invokeSuccessToast({ description: 'Profile updated successfully.' });
      useQueryCache().invalidateQueries(agentAccountProfileQuery());
    },
    onError: (error) => {
      invokeErrorToast({
        description:
          error.message || 'An error occurred while updating the profile.',
      });
    },
  });

  return {
    data,
    ...query,
    formSchema,
    formState,
    mutate,
  };
});

export const useAccountPasskeyCredentialsMutation = defineMutation(() => {
  const { data, ...query } = useQuery(agentAccountPasskeyCredentialsListQuery);
  const { user } = useUserSession();
  const { register } = useWebAuthn({
    registerEndpoint: '/api/auth/passkey/register',
  });

  // Add a new passkey credential with the given alias
  const formRegisterSchema = agentAccountPasskeyOptionsSchema;
  type FormRegisterSchemaOutput = z.output<typeof formRegisterSchema>;
  const formRegisterState = reactive<FormRegisterSchemaOutput>({
    alias: '',
  });

  const { mutate: mutateRegister } = useMutation({
    mutation: () => {
      return register({
        userName: user.value?.username as string,
        alias: formRegisterState.alias,
      });
    },
    onError: (error) => {
      invokeErrorToast({
        title: 'Failed to register passkey',
        description:
          error.message || 'An error occurred while registering the passkey.',
      });
    },
    onSuccess: () => {
      invokeSuccessToast({ title: 'Passkey registered successfully.' });
      formRegisterState.alias = '';
      useQueryCache().invalidateQueries(
        agentAccountPasskeyCredentialsListQuery(),
      );
    },
  });

  // Remove a passkey credential by its ID
  const { mutate: mutateDelete } = useMutation({
    mutation: (credentialId: string) =>
      useAPI(`/api/auth/passkey/${credentialId}`, { method: 'DELETE' }),
    onSuccess: () => {
      invokeInfoToast({ title: 'Passkey deleted successfully.' });
      useQueryCache().invalidateQueries(
        agentAccountPasskeyCredentialsListQuery(),
      );
    },
  });

  const safeDelete = async (credentialId: string) => {
    useConfirmationModal({
      title: 'Confirm Passkey Deletion',
      message: 'Are you sure you want to delete this passkey?',
      confirmLabel: 'Yes, destroy credential',
      danger: true,
      onConfirm() {
        mutateDelete(credentialId);
      },
    });
  };

  return {
    data,
    ...query,
    formRegisterSchema,
    formRegisterState,
    mutateRegister,
    mutateDelete,
    safeDelete,
  };
});
