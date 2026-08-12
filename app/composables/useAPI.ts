import { ModalPasswordConfirmation } from '#components';

type fetchPath = Parameters<typeof $fetch>[0];
type fetchOptions = Parameters<typeof $fetch>[1];

export async function useAPI<T>(
  url: fetchPath,
  options?: fetchOptions,
  isConfirmationRetry = false,
): Promise<T> {
  // Forward cookies from SSR requests
  const headers = useRequestHeaders(['cookie']);
  const response = await $fetch.raw<T>(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
    ignoreResponseError: true,
    responseType: 'json',
  });

  if (response.status === 428 && !isConfirmationRetry) {
    const data = response._data as { data?: { confirmationToken?: string } };
    const confirmationToken = data.data?.confirmationToken;
    if (!confirmationToken) {
      throw Object.assign(
        new Error(
          'Confirmation required, but no token was provided by the server.',
        ),
        {
          status: response.status,
          data: response._data,
        },
      );
    }

    const overlay = useOverlay();
    const modal = overlay.create(ModalPasswordConfirmation, {
      destroyOnClose: true,
    });
    return await new Promise<T>((resolve, reject) => {
      modal.open({
        intentionToken: confirmationToken,
        onConfirmed: async () => {
          try {
            const retryOptions = {
              ...options,
              headers: {
                ...options?.headers,
                'x-rf-confirmation-token': confirmationToken,
              },
            } as fetchOptions;
            resolve(await useAPI<T>(url, retryOptions, true));
            modal.close();
          } catch (error) {
            reject(error);
          }
        },
        onCancelled: () => {
          reject(
            Object.assign(
              new Error('User cancelled the confirmation process.'),
              {
                status: 428,
                data: response._data,
              },
            ),
          );
        },
      });
    });
  }

  if (!response.ok) {
    throw Object.assign(
      new Error(
        (response._data as { message?: string } | undefined)?.message ||
          'API request failed',
      ),
      {
        status: response.status,
        data: response._data,
      },
    );
  }

  return response._data as T;
}
