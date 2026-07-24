import type { ComponentExposed } from 'vue-component-type-helpers';
import type { UForm } from '#components';
import { RedflareConfigCategory } from '~~/shared/enums/Config';
import { configByCategoryQuery } from '~/queries/config';
import _ from 'lodash';
import z from 'zod';

export const useGeneralConfigMutation = (formComponent: Ref<ComponentExposed<typeof UForm>>) => defineMutation(() => {
  const schema = redflareConfigGeneralSchema;
  type Schema = z.output<typeof schema>;
  const formState = reactive<Schema>(schema.parse({}));

  const { data, ...query } = useQuery(configByCategoryQuery(RedflareConfigCategory.General));

  // Sync remote config into local form state whenever it (re)loads
  watch(data, (remote) => {
    if (!remote) return;
    _.assign(formState, _.pick(remote, Object.keys(schema.shape)));
  }, { immediate: true });

  const { mutate, ...mutation } = useMutation({
    mutation: () => useAPI('/api/config/general', { method: 'POST', body: formState }),
    onSettled: () => useQueryCache().invalidateQueries(configByCategoryQuery(RedflareConfigCategory.General))
  });

  return {
    submit: async () => { await formComponent.value.validate({}); mutate(); },
    schema,
    formState,
    busy: mutation.isLoading || query.isLoading,
    ...mutation,
    ...query
  };
});