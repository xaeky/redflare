<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UButton, UIcon, ULink, SharedCommissionStatusBadge, BackofficeCommissionEditSlideover } from '#components';

defineProps<{
  commissions: WithCustomer<DeserializedCommission>[]
}>();
const sorting = defineModel('sorting', {
  type: Array as () => { id: string; desc: boolean }[],
  default: () => [{ id: 'created_at', desc: true }]
});

// Overlays
const overlay = useOverlay();
const editSlideoverOverlay = overlay.create(BackofficeCommissionEditSlideover);

type DeserializedCommissionWithCustomer = WithCustomer<DeserializedCommission>;
const columns: TableColumn<DeserializedCommissionWithCustomer>[] = [
  {
    id: 'id',
    accessorKey: '_id',
    header: '#',
    cell: ({row}) => {
      const thisCommission = row.original;
      const idDigit = thisCommission._id.substring(thisCommission._id.length - 6);
      return h('div', { class: 'flex items-center gap-2' }, [
        h(ULink, { to: `/commission/${thisCommission._id}`, target: '_blank', class: 'inline-flex items-center' },
          () => [ h(UIcon, { name: 'i-lucide-link-2' }) ]),
        h('span', { class: 'font-mono uppercase' }, idDigit)
      ])
    }
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => {
      const thisCommission = row.original;
      const { name, vrc_id } = thisCommission.customer;
      const items = [ h('span', { class: 'font-semibold' }, name) ];
      if (vrc_id) items.unshift(h(UButton, {
        variant: 'soft',
        color: 'neutral',
        size: 'sm',
        icon: 'i-heroicons-arrow-top-right-on-square-16-solid',
        onClick: () => {
          const baseURI = 'https://vrchat.com/home/user';
          navigateTo(`${baseURI}/${vrc_id}`, { external: true, open: { target: '_blank' } });
        }
      }))
      return h('div', { class: 'space-x-2' }, items)
    }
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({row}) => h(SharedCommissionStatusBadge, { status: row.original.status, size: 'md' })
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
    cell: ({ row }) => {
      return h(UButton, {
        icon: 'i-heroicons-pencil-square-20-solid',
        size: 'lg',
        variant: 'soft',
        onClick() {
          editSlideoverOverlay.open({
            commission_id: row.original._id
          });
        }
      })
    }
  },
];
</script>

<template>
  <UTable
    v-model:sorting="sorting"
    :columns
    :data="commissions"
  />
</template>