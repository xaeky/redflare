<script setup lang="ts">
import _ from 'lodash';
import type { TableColumn } from '@nuxt/ui';
import { UButton, UTooltip } from '#components';
import { BackofficeCustomerEditSlideover } from '#components';

const props = defineProps<{
  customers: DeserializedCustomer[]
}>();
const sorting = defineModel('sorting', {
  type: Array as () => { id: string; desc: boolean }[],
  default: () => [{ id: 'created_at', desc: true }]
});
const customers = computed(() => props.customers);
const overlay = useOverlay();
const customerFormStore = useCustomerFormStore();

function handleVRCProfileVisit(id: string) {
  const baseURI = 'https://vrchat.com/home/user';
  navigateTo(`${baseURI}/${id}`, { external: true, open: { target: '_blank' } });
}

function handleEditButton(customer: DeserializedCustomer) {
  _.assign(customerFormStore.formState, _.pick(customer, Object.keys(customerFormStore.schema.shape)));
  customerFormStore.additionalState.id = customer._id as string;
  overlay.create(BackofficeCustomerEditSlideover, {
    destroyOnClose: true
  }).open();
}

const columns: TableColumn<DeserializedCustomer>[] = [
  {
    accessorKey: 'name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => sortingHeader('Name', column),
    cell: ({row}) => row.getValue('name')
  },
  {
    accessorKey: 'socials',
    header: 'Socials',
    cell: ({row}) => {
      const hasVRC = !!row.original.vrc_id;
      const hasDiscord = !!row.original.discord_id;
      const hasTelegram = !!row.original.telegram_id;
      return h('div',
        {
          class: 'flex items-center gap-2'
        },
        [
          hasVRC ? h(UTooltip, {
            text: 'Visit VRChat Profile',
            placement: 'top'
          }, {
            default: () => h(UButton, {
              icon: 'i-bi-headset-vr', size: 'sm', variant: 'soft',
              onClick: () => handleVRCProfileVisit(row.original.vrc_id as string)
            })
          }) : null,
          hasDiscord ? h(UButton, {
            icon: 'i-bi-discord', size: 'sm', variant: 'soft'
          }) : null,
          hasTelegram ? h(UButton, {
            icon: 'i-bi-telegram', size: 'sm', variant: 'soft'
          }) : null
        ]
      )
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