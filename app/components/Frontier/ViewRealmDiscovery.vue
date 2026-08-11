<script setup lang="ts">
import {
  FrontierRealmDiscoveryWhoAreYou,
  FrontierRealmDiscoveryAuthAgent,
  FrontierRealmDiscoveryAuthPublic,
} from '#components';

type RealmView = 'who-are-you' | 'auth-agent' | 'auth-public';
type Realm = 'agent' | 'public';

const emit = defineEmits<{
  authenticated: [realm: Realm];
}>();

const currentView = ref<RealmView>('who-are-you');
const transitionName = ref<'slide-left' | 'slide-right'>('slide-left');

const viewComponents = {
  'who-are-you': FrontierRealmDiscoveryWhoAreYou,
  'auth-agent': FrontierRealmDiscoveryAuthAgent,
  'auth-public': FrontierRealmDiscoveryAuthPublic,
} as const;

const handleSelectRealm = (realm: Realm) => {
  transitionName.value = 'slide-left';
  currentView.value = realm === 'agent' ? 'auth-agent' : 'auth-public';
};

const handleBack = () => {
  transitionName.value = 'slide-right';
  currentView.value = 'who-are-you';
};

const handleAuthenticated = (realm: Realm) => {
  emit('authenticated', realm);
};
</script>

<template>
  <Transition :name="transitionName" mode="out-in">
    <component
      :is="viewComponents[currentView]"
      :key="currentView"
      @view-select="handleSelectRealm"
      @view-back="handleBack"
      @view-authenticated="handleAuthenticated(currentView === 'auth-agent' ? 'agent' : 'public')"
    />
  </Transition>
</template>

<style scoped>
@reference '~/assets/global.css';

.slide-left-enter-from { transform: translateX(15%); }
.slide-left-leave-to { transform: translateX(-5%); }
.slide-left-leave-active {
  transition-duration: 0.125s;
  transition-timing-function: var(--ease-expo-smoothattack);
  position: relative;
}
.slide-left-enter-active {
  transition-duration: 0.4s;
  transition-timing-function: var(--ease-expo-smoothrelease);
  position: relative;
}

.slide-right-enter-from { transform: translateX(-15%); }
.slide-right-leave-to { transform: translateX(5%); }
.slide-right-leave-active {
  transition-duration: 0.125s;
  transition-timing-function: var(--ease-expo-smoothattack);
  position: relative;
}
.slide-right-enter-active {
  transition-duration: 0.4s;
  transition-timing-function: var(--ease-expo-smoothrelease);
  position: relative;
}

.realm-discovery-view-container {
  @apply w-full sm:max-w-md mx-auto sm:ring ring-muted/35 sm:shadow-xl sm:p-8 rounded-lg
  sm:bg-linear-to-t from-muted/25 via-muted/25 to-neutral-600/25 sm:backdrop-blur-md relative;
}
</style>