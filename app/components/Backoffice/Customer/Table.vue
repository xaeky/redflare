<script setup lang="ts">
import { customersQuery } from '~/queries/customers';
import type { TableColumn } from '@nuxt/ui';
import { UButton } from '#components';

// Props & vars
const props = defineProps<{
  customers: Customer[]
}>();
const customers = computed(() => props.customers);

const toast = useToast();
const queryCache = useQueryCache();
const editSlideoverOpen = ref(false);
const editSlideoverData = ref<Customer | null>(null);
const deleteModalOpen = ref(false);
const deleteModalData = ref<Customer | null>(null);

// Mutations
const { mutate: deleteCustomer, isLoading: deleteCustomerBusy } = useMutation({
  mutation: () => useAPI(`/api/customers/${deleteModalData.value?.id}`, { method: 'DELETE' }),
  onSuccess() {
    queryCache.invalidateQueries(customersQuery);
    toast.add({
      description: 'Customer deleted.'
    });
  }
})

function handleVRCProfileVisit(id: string) {
  const baseURI = 'https://vrchat.com/home/user';
  navigateTo(`${baseURI}/${id}`, { external: true, open: { target: '_blank' } });
}

function handleDeleteConfirm() {
  deleteCustomer();
}

const columns: TableColumn<Customer>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({row}) => (row.getValue('id') as string).slice(0, 6).toUpperCase()
  },
  {
    accessorKey: 'name',
    header: 'Name',
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
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({row}) => new Date(row.getValue('created_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
            onClick() {
              const thisCustomer = customers.value?.find(c => row.getValue('id') === c.id) as Customer;
              editSlideoverData.value = thisCustomer;
              editSlideoverOpen.value = true;
            }
          }),
          h(UButton, {
            icon: 'i-heroicons-trash-20-solid',
            size: 'lg',
            color: 'error',
            variant: 'soft',
            disabled: deleteCustomerBusy.value,
            onClick() {
              const thisCustomer = customers.value?.find(c => row.getValue('id') === c.id) as Customer;
              deleteModalData.value = thisCustomer;
              deleteModalOpen.value = true;
            }
          })
        ]
      )
    }
  }
]
</script>

<template>
  <UTable :columns :data="customers" class="flex-1" />
  <BackofficeCustomerEditSlideover
    v-model:open="editSlideoverOpen"
    v-model:customer="(editSlideoverData as Customer)"
  />
  <ModalGenericConfirmation
    v-model:open="deleteModalOpen"
    @confirm="handleDeleteConfirm"
  />
</template>