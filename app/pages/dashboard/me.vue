<script setup lang="ts">
import type { NavigationMenuItem, TabsItem } from '@nuxt/ui';
import {
  BackofficeUserSettingsPreferences,
  BackofficeUserSettingsProfile,
  BackofficeUserSettingsSecurity,
} from '#components';

type SettingsSection = 'profile' | 'security' | 'settings';
type MobileView = 'hub' | SettingsSection;

const isMobile = useMediaQuery('(max-width: 640px)');

const userSettingsTabs = ref<TabsItem[]>([
  {
    label: 'Profile',
    icon: 'i-heroicons-user-16-solid',
    slot: 'profile' as const,
  },
  {
    label: 'Security',
    icon: 'i-heroicons-lock-closed-16-solid',
    slot: 'security' as const,
  },
  {
    label: 'Preferences',
    icon: 'i-heroicons-cog-16-solid',
    slot: 'settings' as const,
  },
]);

// Mobile mini-router: a hub menu that drills into each section.
const sectionComponents = {
  profile: BackofficeUserSettingsProfile,
  security: BackofficeUserSettingsSecurity,
  settings: BackofficeUserSettingsPreferences,
} as const;

const currentView = ref<MobileView>('hub');
const activeSectionComponent = computed(() =>
  currentView.value === 'hub' ? null : sectionComponents[currentView.value],
);

const hubItems: NavigationMenuItem[] = [
  {
    label: 'Profile',
    icon: 'i-heroicons-user-16-solid',
    onSelect: () => (currentView.value = 'profile'),
  },
  {
    label: 'Security',
    icon: 'i-heroicons-lock-closed-16-solid',
    onSelect: () => (currentView.value = 'security'),
  },
  {
    label: 'Preferences',
    icon: 'i-heroicons-cog-16-solid',
    onSelect: () => (currentView.value = 'settings'),
  },
];

const handleBack = () => {
  currentView.value = 'hub';
};

definePageMeta({
  title: 'User Settings',
  middleware: 'agent-only',
  layout: 'backoffice',
  keepalive: true,
});
</script>

<template>
  <div>
    <div v-if="isMobile">
      <UNavigationMenu
        v-if="currentView === 'hub'"
        :items="hubItems"
        orientation="vertical"
        :ui="{ list: 'bg-muted rounded-lg', link: 'gap-3 px-4 py-3 text-lg border-b border-neutral-700', item: 'last:[&>button]:border-b-0' }"
      />
      <div v-else class="space-y-4">
        <UButton
          icon="i-heroicons-arrow-left-16-solid"
          label="Back"
          variant="outline"
          color="neutral"
          @click="handleBack"
          block
          size="xl"
        />
        <component :is="activeSectionComponent" />
      </div>
    </div>
    <UTabs
      v-else
      variant="link"
      :items="userSettingsTabs"
      orientation="vertical"
      :unmount-on-hide="false"
      class="w-full"
      :ui="{ trigger: 'grow', root: 'items-start', list: 'w-xs' }"
    >
      <template #profile>
        <BackofficeUserSettingsProfile />
      </template>
      <template #security>
        <BackofficeUserSettingsSecurity />
      </template>
      <template #settings>
        <BackofficeUserSettingsPreferences />
      </template>
    </UTabs>
  </div>
</template>
