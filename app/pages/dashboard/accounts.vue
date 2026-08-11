<script setup lang="ts">
import { agentAccountsQuery } from '~/queries/accounts';

definePageMeta({
  title: 'Accounts',
  description: 'Manage artist accounts',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});

const toast = useToast();
const { user } = useUserSession();
const { data: accounts, refresh, asyncStatus } = useQuery(agentAccountsQuery, () => ({}));

const createFormState = reactive({
  username: '',
  password: '',
  displayName: '',
  permissions: [] as Permission[]
});
const createBusy = ref(false);

const togglePermission = (permission: Permission, checked: boolean | 'indeterminate') => {
  if (checked) {
    if (!createFormState.permissions.includes(permission)) createFormState.permissions.push(permission);
  } else {
    createFormState.permissions = createFormState.permissions.filter(p => p !== permission);
  }
};

const createAccount = async () => {
  createBusy.value = true;
  try {
    await useAPI('/api/admin/accounts', {
      method: 'POST',
      body: {
        username: createFormState.username,
        password: createFormState.password,
        displayName: createFormState.displayName || undefined,
        permissions: createFormState.permissions
      }
    });
    createFormState.username = '';
    createFormState.password = '';
    createFormState.displayName = '';
    createFormState.permissions = [];
    toast.add({ title: 'Account created', color: 'success' });
    await refresh();
  } catch (error) {
    toast.add({
      title: 'Failed to create account',
      description: (error as any).data?.statusText || (error as any).data?.message,
      color: 'error'
    });
  } finally {
    createBusy.value = false;
  }
};

const deleteAccount = async (id: string) => {
  try {
    await useAPI(`/api/admin/accounts/${id}`, { method: 'DELETE' });
    toast.add({ title: 'Account deleted', color: 'success' });
    await refresh();
  } catch (error) {
    toast.add({
      title: 'Failed to delete account',
      description: (error as any).data?.statusText || (error as any).data?.message,
      color: 'error'
    });
  }
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="asyncStatus === 'loading'" class="space-y-4">
      <USkeleton class="w-full h-12" v-for="_ in new Array(3)" />
    </div>
    <UTable
      v-else
      :data="accounts || []"
      :columns="[
        { accessorKey: 'username', header: 'Username' },
        { accessorKey: 'displayName', header: 'Display name' },
        { accessorKey: 'createdAt', header: 'Created' },
        { accessorKey: '_id', header: '' }
      ]"
    >
      <template #displayName-cell="{ row }">{{ row.original.displayName || '—' }}</template>
      <template #createdAt-cell="{ row }">{{ new Date(row.original.createdAt).toLocaleDateString() }}</template>
      <template #_id-cell="{ row }">
        <UButton
          v-if="row.original._id !== user?.id"
          size="xs" color="error" variant="soft" icon="i-heroicons-trash-20-solid"
          @click="deleteAccount(row.original._id.toString())"
        />
      </template>
    </UTable>

    <div class="max-w-sm space-y-2">
      <h3 class="font-bold">Add account</h3>
      <form class="flex flex-col gap-2" @submit.prevent="createAccount">
        <UInput v-model="createFormState.username" placeholder="Username" autocomplete="off" />
        <UInput v-model="createFormState.displayName" placeholder="Display name (optional)" />
        <UInput v-model="createFormState.password" type="password" placeholder="Password" autocomplete="new-password" />

        <div class="space-y-1">
          <span class="text-sm font-medium">Permissions</span>
          <UCheckbox
            v-for="permission in ALL_PERMISSIONS"
            :key="permission"
            :model-value="createFormState.permissions.includes(permission)"
            :name="`permission-${permission}`"
            :label="permission"
            @update:model-value="(checked) => togglePermission(permission, checked)"
          />
        </div>

        <UButton type="submit" :loading="createBusy" label="Create account" block />
      </form>
    </div>
  </div>
</template>
