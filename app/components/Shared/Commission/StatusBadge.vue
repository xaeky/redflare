<script setup lang="ts">
import { CommissionStatusType } from '~~/shared/enums/Commissions';

const props = withDefaults(defineProps<{
  status: CommissionStatusType | number,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), { status: CommissionStatusType.Backlog, size: 'xl' });
type colorType = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
const defaultLabel = {
  label: 'Invalid status',
  color: 'neutral',
  icon: 'i-lucide-circle-question-mark'
}
const statusLabels:Record<CommissionStatusType, { label: string; color: colorType, icon: string }> = {
  [CommissionStatusType.None]: { label: 'None', color: 'neutral', icon: 'i-lucide-circle-question-mark' },
  [CommissionStatusType.Backlog]: { label: 'Backlog', color: 'neutral', icon: 'i-lucide-circle-question-mark' },
  [CommissionStatusType.Cancelled]: { label: 'Cancelled', color: 'neutral', icon: 'i-lucide-circle-minus' },
  [CommissionStatusType.InCooldown]: { label: 'In Cooldown', color: 'secondary', icon: 'i-lucide-circle-stop' },
  [CommissionStatusType.InDevelopment]: { label: 'In Development', color: 'info', icon: 'i-lucide-circle-play' },
  [CommissionStatusType.InSetup]: { label: 'In Project Setup', color: 'neutral', icon: 'i-lucide-circle-dashed' },
  [CommissionStatusType.Maintenance]: { label: 'Maintenance', color: 'warning', icon: 'i-lucide-hammer' },
  [CommissionStatusType.Missing]: { label: 'Missing files', color: 'error', icon: 'i-lucide-circle-alert' },
  [CommissionStatusType.NextUp]: { label: 'Next Up', color: 'warning', icon: 'i-lucide-circle-ellipsis' },
  [CommissionStatusType.Settled]: { label: 'Settled', color: 'success', icon: 'i-lucide-circle-check-big' },
  [CommissionStatusType.Showtime]: { label: 'Showtime', color: 'success', icon: 'i-lucide-sparkles' }
}
const thisLabel = statusLabels[props.status as CommissionStatusType] || defaultLabel;
</script>

<template>
  <UBadge :color="(thisLabel.color as colorType)" :label="thisLabel.label" :icon="thisLabel.icon" :size variant="soft" class="rounded-full font-bold" />
</template>