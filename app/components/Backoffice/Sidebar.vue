<script setup lang="ts">
interface SidebarLink {
  label: string;
  icon: string;
  to: string;
}

const links:SidebarLink[] = [
  {
    label: 'Home',
    icon: 'i-heroicons-home-20-solid',
    to: '/dashboard'
  },
  {
    label: 'Commissions',
    icon: 'i-heroicons-sparkles-solid',
    to: '/dashboard/commissions'
  },
  {
    label: 'Avatar Bases',
    icon: 'i-lucide-cat',
    to: '/dashboard/bases'
  },
  {
    label: 'Customers',
    icon: 'i-heroicons-at-symbol-solid',
    to: '/dashboard/customers'
  }
];
</script>

<template>
  <aside id="redflare_backoffice_sidebar" class="flex flex-col gap-4 border-r border-r-neutral-800 p-4">
    <div v-for="link in links as SidebarLink[]" :key="link.to">
      <UTooltip :content="{ side: 'right' }" arrow :text="link.label" :delay-duration="0">
        <ULink
          :to="link.to"
          class="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-800"
        >
          <UIcon :name="link.icon" size="20" />
        </ULink>
      </UTooltip>
    </div>
    <DevOnly>
      <UTooltip :content="{ side: 'right' }" arrow text="Development" :delay-duration="0">
        <ULink
          to="/dashboard/dev"
          class="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-800"
        >
          <UIcon name="i-heroicons-code-bracket-20-solid" size="20" />
        </ULink>
      </UTooltip>
    </DevOnly>
  </aside>
</template>