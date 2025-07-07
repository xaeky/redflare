<script setup lang="ts">
const props = withDefaults(defineProps<{
  status: CommissionStatus | string,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), { status: 'backlog', size: 'xl' });
type colorType = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
const defaultLabel = {
  label: 'Invalid status',
  color: 'neutral',
  icon: 'i-lucide-circle-question-mark'
}
const statusLabels:Record<CommissionStatus, { label:string; color:colorType, icon:string }> = {
  backlog: { label: 'Backlog', color: 'neutral', icon: 'i-lucide-circle-question-mark' },
  cancelled: { label: 'Cancelled', color: 'neutral', icon: 'i-lucide-circle-minus' },
  in_cooldown: { label: 'In Cooldown', color: 'secondary', icon: 'i-lucide-circle-stop' },
  in_development: { label: 'In Development', color: 'info', icon: 'i-lucide-circle-play' },
  in_setup: { label: 'In Project Setup', color: 'neutral', icon: 'i-lucide-circle-dashed' },
  maintenance: { label: 'Maintenance', color: 'warning', icon: 'i-lucide-hammer' },
  missing: { label: 'Missing files', color: 'error', icon: 'i-lucide-circle-alert' },
  next_up: { label: 'Next Up', color: 'warning', icon: 'i-lucide-circle-ellipsis' },
  settled: { label: 'Settled', color: 'neutral', icon: 'i-lucide-circle-check-big' },
  showtime: { label: 'Showtime', color: 'success', icon: 'i-lucide-sparkles' }
}
const thisLabel = statusLabels[props.status as CommissionStatus] || defaultLabel;
</script>

<template>
  <UBadge :color="thisLabel.color" :label="thisLabel.label" :icon="thisLabel.icon" :size variant="soft" />
</template>