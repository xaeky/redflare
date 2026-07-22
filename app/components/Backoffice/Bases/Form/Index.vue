<script setup lang="ts">
import { enumToSelectItems } from '@@/shared/enums/Index';
import { AvatarBaseFlagsType } from '@@/shared/enums/Commissions';

const avatarBaseFormStore = useAvatarBaseFormStore();

function flagsModel(flag: AvatarBaseFlagsType) {
  return computed({
    get: () => !!(avatarBaseFormStore.formState.flags & flag),
    set: (checked: boolean) => {
      if (checked) {
        avatarBaseFormStore.formState.flags |= flag;
      } else {
        avatarBaseFormStore.formState.flags &= ~flag;
      }
    }
  });
}

const isPrivate = flagsModel(AvatarBaseFlagsType.Private);
const isMeshKitbash = flagsModel(AvatarBaseFlagsType.MeshKitbash);
const isMeshEdit = flagsModel(AvatarBaseFlagsType.MeshEdit);
</script>

<template>
  <UForm :schema="avatarBaseFormStore.schema" :state="avatarBaseFormStore.formState" class="space-y-4">
    <UFormField name="name" label="Name">
      <UInput v-model="avatarBaseFormStore.formState.name" class="w-full" />
    </UFormField>
    <UFormField name="creator_name" label="Creator name">
      <UInput v-model="avatarBaseFormStore.formState.creator_name" class="w-full" />
    </UFormField>
    <UFormField name="storefront_url" label="Storefront URL">
      <UInput v-model="avatarBaseFormStore.formState.storefront_url" class="w-full" />
    </UFormField>
    <UFormField name="flags" label="Flags">
      <div class="flex flex-col gap-2">
        <UCheckbox v-model="isPrivate" label="Private" />
        <UCheckbox v-model="isMeshKitbash" label="Kitbash" />
        <UCheckbox v-model="isMeshEdit" label="Mesh Edit" />
      </div>
      <UAlert color="neutral" variant="soft" class="mt-2" v-if="isPrivate" icon="i-heroicons-information-circle-16-solid">
        <template #description>
          Marking an avatar base as private will exclude it from being displayed in the Public API.
        </template>
      </UAlert>
    </UFormField>
  </UForm>
</template>