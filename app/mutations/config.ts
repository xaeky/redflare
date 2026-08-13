import _ from 'lodash';
import type { ComponentExposed } from 'vue-component-type-helpers';
import type z from 'zod';
import type { UForm } from '#components';
import { configByCategoryQuery } from '~/queries/config';
import { RedflareConfigCategory } from '~~/shared/enums/Config';

const useConfigCategoryMutation = <Schema extends z.ZodObject<z.ZodRawShape>>(
  category: RedflareConfigCategory,
  schema: Schema,
  formComponent: Ref<ComponentExposed<typeof UForm>>,
) =>
  defineMutation(() => {
    type SchemaOutput = z.output<Schema>;
    let formState: ReturnType<typeof reactive<SchemaOutput>>;
    try {
      formState = reactive<SchemaOutput>(schema.parse({}));
    } catch (err) {
      console.error(
        `Failed to parse schema for category config ${category}:`,
        err,
      );
      throw err;
    }

    const { data, ...query } = useQuery(configByCategoryQuery(category));

    // Sync remote config into local form state whenever it (re)loads
    watch(
      data,
      (remote) => {
        if (!remote) return;
        _.assign(formState, _.pick(remote, Object.keys(schema.shape)));
      },
      { immediate: true },
    );

    const { mutate, ...mutation } = useMutation({
      mutation: () =>
        useAPI(`/api/admin/config/${category}`, { method: 'POST', body: formState }),
      onSettled: () =>
        useQueryCache().invalidateQueries(configByCategoryQuery(category)),
    });

    return {
      submit: async () => {
        await formComponent.value.validate({ silent: true });
        mutate();
      },
      schema,
      formState,
      busy: mutation.isLoading || query.isLoading,
      ...mutation,
      ...query,
    };
  });

export const useGeneralConfigMutation = (
  formComponent: Ref<ComponentExposed<typeof UForm>>,
) =>
  useConfigCategoryMutation(
    RedflareConfigCategory.General,
    redflareConfigGeneralSchema,
    formComponent,
  );

export const useKnowledgeBaseConfigMutation = (
  formComponent: Ref<ComponentExposed<typeof UForm>>,
) =>
  useConfigCategoryMutation(
    RedflareConfigCategory.KnowledgeBase,
    redflareConfigKnowledgeBaseSchema,
    formComponent,
  );

export const useLegalConfigMutation = (
  formComponent: Ref<ComponentExposed<typeof UForm>>,
) =>
  useConfigCategoryMutation(
    RedflareConfigCategory.Legal,
    redflareConfigLegalSchema,
    formComponent,
  );

export const useEmailConfigMutation = (
  formComponent: Ref<ComponentExposed<typeof UForm>>,
) =>
  useConfigCategoryMutation(
    RedflareConfigCategory.Email,
    redflareConfigEmailSchema,
    formComponent,
  );
