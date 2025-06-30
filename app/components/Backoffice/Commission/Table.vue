<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UButton } from '#components';

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
    cell: ({row}) => (row.getValue('id') as string).slice(0, 6).toUpperCase()
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => {
      const thisCommission = row.original;
      const { id, name, vrc_id } = thisCommission.customer;
      // TODO: Make a button to invoke a slideover with customer details and actions
      const items = [ h('span', { class: 'font-semibold' }, name) ];
      if (vrc_id) items.push(h(UButton, {
        label: 'See profile',
        variant: 'soft',
        color: 'neutral',
        size: 'sm',
        icon: 'i-heroicons-arrow-top-right-on-square-16-solid',
        onClick: () => {
          const baseURI = 'https://vrchat.com/home/user';
          navigateTo(`${baseURI}/${vrc_id}`, { external: true, open: { target: '_blank' } });
        }
      }))
      return h('div', { class: 'space-x-4' }, items)
    }
  },
  {
    id: 'characters',
    header: '# Characters',
    cell: ({row}) => {
      const thisCommission = row.original;
      const charactersLength = thisCommission.n_characters;
      return h('span', { class: 'font-semibold' }, charactersLength.toString());
    }
  },
  {
    id: 'latest_payment',
    header: 'Latest Payment',
    cell: ({row}) => {
      const thisCommission = row.original;
      return h('span', { class: 'font-semibold' }, thisCommission.latest_payment.state);
    }
  },
  {
    header: 'Status',
    accessorKey: 'status'
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({row}) => new Date(row.getValue('created_at')).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
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