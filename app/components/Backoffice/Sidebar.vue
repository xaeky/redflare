<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const { clear, session } = useUserSession();

const links:NavigationMenuItem[] = [
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

const userDropdownItems: DropdownMenuItem[] = [
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-16-solid',
    onSelect: () => navigateTo('/dashboard/me')
  },
  {
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-end-on-rectangle-16-solid',
    async onSelect() {
      await clear();
      navigateTo('/');
    }
  }
]
</script>

<template>
  <USidebar :ui="{ inner: 'bg-elevated/25' }">
    <template #header>
      <HeaderLogo />
    </template>
    <template #default>
      <UNavigationMenu
        :items="links"
        orientation="vertical"
        :ui="{ list: 'space-y-1' }"
      />
    </template>
    <template #footer>
      <UDropdownMenu
        :items="userDropdownItems"
        v-if="session && session.user"
      >
        <UButton square class="w-full" variant="ghost" color="neutral" :label="session.user.nickname" :avatar="{ src: session.user.picture }" />
      </UDropdownMenu>
    </template>
  </USidebar>
</template>