<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UButton, ULink, SharedCommissionStatusBadge } from '#components';

// Props & vars
const props = defineProps<{
  commissions: SerializedCommission[]
}>();
const commissions = computed(() => props.commissions);
const editSlideoverData = ref<SerializedCommission | null>(null);
const editSlideoverOpen = ref(false);

const columns: TableColumn<SerializedCommission>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({row}) => {
      const thisCommission = row.original;
      return h('div', { class: 'flex items-center gap-2' }, [
        h(ULink, { to: `/commission/${thisCommission.id}`, target: '_blank' },
          [ h(UButton, { icon: 'i-lucide-link-2', color: 'neutral', size: 'sm', variant: 'soft' }) ]),
        h('span', { class: 'font-mono uppercase' }, thisCommission.id.substring(0, 6))
      ])
    }
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => {
      const thisCommission = row.original;
      const { id, name, vrc_id } = thisCommission.customer;
      // TODO: Make a button to invoke a slideover with customer details and actions
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
    id: 'latest_payment',
    header: 'Latest Payment',
    cell: ({row}) => {
      const thisCommission = row.original;
      const latestPayment = thisCommission.latest_payment ? thisCommission.latest_payment.state : 'None';
      return h('span', { class: 'font-semibold' }, latestPayment);
    }
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({row}) => h(SharedCommissionStatusBadge, { status: row.original.status, size: 'md' })
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({row}) => new Date(row.getValue('created_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  },
  {
    accessorKey: 'updated_at',
    header: 'Modified',
    cell: ({row}) => new Date(row.getValue('updated_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
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
          const thisCommission = row.original;
          editSlideoverData.value = thisCommission;
          editSlideoverOpen.value = true;
        }
      })
    }
  },
];
</script>

<template>
  <UTable :columns :data="commissions" />
  <BackofficeCommissionEditSlideover v-model:open="editSlideoverOpen" :commission="(editSlideoverData as SerializedCommission)" />
</template>