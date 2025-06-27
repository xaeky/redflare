<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const { clear } = useUserSession();

const userDropdownOpen = ref(false);
const userDropdownItems: DropdownMenuItem[] = [
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-16-solid'
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
const userDropdownToggle = () => { userDropdownOpen.value = !userDropdownOpen.value }

const { session } = useUserSession();
</script>

<template>
  <div
    class="border-l border-neutral-800 hover:bg-neutral-800 cursor-pointer h-12 flex items-center px-6"
    v-if="session && session.user" @click.stop="userDropdownToggle"
  >
    <UDropdownMenu
      :items="userDropdownItems"
      v-model:open="userDropdownOpen" :ui="{ content: 'w-48' }"
    >
      <div class="flex items-center gap-4 pointer-events-none select-none">
        <UAvatar :src="session.user.picture" />
        <span v-text="session.user.nickname" />
      </div>
    </UDropdownMenu>
  </div>
</template>