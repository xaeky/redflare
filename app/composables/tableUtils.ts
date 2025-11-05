import { UButton } from '#components';
import type { Column } from '@tanstack/table-core';

function sortingHeader<T>(label: string, column: Column<T>) {
  const isSorted = column.getIsSorted();
  return h(UButton, {
    label,
    variant: 'soft',
    color: isSorted ? (column.getIsSorted() === 'asc' ? 'primary' : 'secondary') : 'neutral',
    size: 'sm',
    icon: isSorted ? (isSorted === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : 'i-lucide-arrow-down-wide-narrow')
      : 'i-lucide-arrow-up-down',
    onClick: () => column.toggleSorting(),
  });
}

export { sortingHeader };