<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui';
import { UButton, UTooltip, SharedCommissionStatusBadge, BackofficeCommissionEditSlideover } from '#components';

defineProps<{
  commissions: WithCustomer<DeserializedCommission>[]
}>();
const sorting = defineModel<{ id: string; desc: boolean }[]>({
  default: () => [{ id: 'created_at', desc: true }]
});

// Overlays
const overlay = useOverlay();
const editSlideoverOverlay = overlay.create(BackofficeCommissionEditSlideover);

// Clipboard
const clipboard = useClipboard();
const copyCommissionLink = (commissionId: string) => {
  const link = `${window.location.origin}/commission/${commissionId}`;
  clipboard.copy(link);
  useToast().add({ title: 'Copied commission link to clipboard.', duration: 3000, color: 'success', icon: 'i-lucide-clipboard-check' });
};
const copyCommissionId = (commissionId: string) => {
  clipboard.copy(commissionId);
  useToast().add({ title: 'Copied commission ID to clipboard.', duration: 3000, color: 'success', icon: 'i-lucide-clipboard-check' });
};

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
        h(UButton, { onClick: () => copyCommissionLink(thisCommission._id), icon: 'i-lucide-link-2', size: 'sm', variant: 'soft', color: 'neutral' }),
        h(UTooltip, { text: 'Copy full commission ID', delayDuration: 0 }, {
          default: () => h('span', { onClick: (e: MouseEvent) => { e.stopPropagation(); copyCommissionId(thisCommission._id) }, class: 'font-mono uppercase' }, idDigit)
        })
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
  }
];

function onRowSelect(_e: Event, row: TableRow<DeserializedCommissionWithCustomer>) {
  editSlideoverOverlay.open({
    commission_id: row.original._id
  });
}
</script>

<template>
  <UTable
    v-model:sorting="sorting"
    :columns
    :data="commissions"
    @select="onRowSelect"
  />
</template>