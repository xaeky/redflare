<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Column } from '@tanstack/table-core';
import { UButton } from '#components';
import { ModalGenericConfirmation, BackofficeCustomerEditSlideover } from '#components';

const props = defineProps<{
  customers: DeserializedCustomer[]
}>();
const sorting = defineModel('sorting', {
  type: Array as () => { id: string; desc: boolean }[],
  default: () => [{ id: 'created_at', desc: true }]
});
const customers = computed(() => props.customers);
const toast = useToast();
const queryCache = useQueryCache();

// Overlays
const overlay = useOverlay();
const confirmationOverlay = overlay.create(ModalGenericConfirmation);
const editSlideoverOverlay = overlay.create(BackofficeCustomerEditSlideover);

// Mutations
const { mutate: deleteCustomer, isLoading: deleteCustomerBusy } = useMutation({
  mutation: (id: string) => useAPI(`/api/customers/${id}`, { method: 'DELETE' }),
  onSuccess() {
    queryCache.invalidateQueries({ key: ['customers'] });
    toast.add({
      description: 'Customer deleted.'
    });
  }
})

function handleVRCProfileVisit(id: string) {
  const baseURI = 'https://vrchat.com/home/user';
  navigateTo(`${baseURI}/${id}`, { external: true, open: { target: '_blank' } });
}

function handleDeleteButton(id: string) {
  confirmationOverlay.open({
    onConfirm: () => deleteCustomer(id),
  });
}

function handleEditButton(customer: DeserializedCustomer) {
  editSlideoverOverlay.open({ customer });
}

const columns: TableColumn<DeserializedCustomer>[] = [
  {
    accessorKey: 'name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => sortingHeader('Name', column),
    cell: ({row}) => row.getValue('name')
  },
  {
    accessorKey: 'vrc_id',
    header: 'VRC Profile',
    cell: ({row}) => {
      const thisValue:string | null = row.getValue('vrc_id')
      const isEmpty = !thisValue || !thisValue.length;
      return isEmpty ? '' : h(UButton, {
        label: 'See profile',
        variant: 'soft',
        color: 'neutral',
        size: 'sm',
        icon: 'i-heroicons-arrow-up-right-20-solid',
        onClick() { handleVRCProfileVisit(row.getValue('vrc_id')) }
      });
    },
  },
  {
    accessorKey: 'created_at',
    sortingFn: 'datetime',
    header: ({ column }) => sortingHeader('Created at', column),
    cell: ({row}) => new Date(row.getValue('created_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  },
  {
    accessorKey: 'updated_at',
    sortingFn: 'datetime',
    header: ({ column }) => sortingHeader('Updated at', column),
    cell: ({row}) => new Date(row.getValue('updated_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({row}) => {
      return h('div',
        {
          class: 'space-x-2',
        },
        [
          h(UButton, {
            icon: 'i-heroicons-pencil-square-20-solid',
            size: 'lg',
            variant: 'soft',
            onClick: () => handleEditButton(row.original)
          }),
          h(UButton, {
            icon: 'i-heroicons-trash-20-solid',
            size: 'lg',
            color: 'error',
            variant: 'soft',
            disabled: deleteCustomerBusy.value,
            onClick: () => handleDeleteButton(row.original._id as string)
          })
        ]
      )
    }
  }
]
</script>

<template>
  <UTable
    v-model:sorting="sorting"
    :columns
    :data="customers"
    class="flex-1"
  />
</template>