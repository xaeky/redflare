<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'base' | 'sm';
  allowLogin?: boolean;
}>(), {
  size: 'base',
  allowLogin: true
});
const { isLoggedIn, login, clear, session } = usePublicUserSession();
const hiddenToAnonymous = (!props.allowLogin && !isLoggedIn.value) || (!isLoggedIn.value && props.allowLogin) || isLoggedIn.value;
</script>

<template>
  <div
    class="rf-publicsession-sessioncard"
    :class="{
      'small-card': size === 'sm'
    }"
    v-if="hiddenToAnonymous"
  >
    <div v-if="!isLoggedIn" class="text-center">
      <UButton label="Login with Discord" icon="i-ic-baseline-discord" @click="() => { login() }" />
    </div>
    <div v-else-if="isLoggedIn && session" class="sc-session-container">
      <div class="flex gap-4 items-center">
        <div>
          <img :src="'/api/public/me/avatar'" alt="User Avatar" class="sc-avatar">
        </div>
        <div class="flex flex-col">
          <span class="sc-loggedinas">Logged In as</span>
          <span v-text="session.user?.global_name" class="sc-globalname" />
        </div>
      </div>
      <div>
        <UButton
          variant="soft" color="neutral" label="Log out" @click="() => { clear() }"
          size="sm" icon="i-heroicons-arrow-left-start-on-rectangle-16-solid"
          class="underline hover:no-underline"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

.rf-publicsession-sessioncard {
  @apply bg-muted rounded-xl p-6;
  .sc-session-container { @apply flex flex-col gap-4; }
  .sc-avatar { @apply rounded-full object-cover w-16 h-16; }
  .sc-loggedinas { @apply text-muted; }
  .sc-globalname { @apply font-bold text-lg; }
  &.small-card {
    @apply p-4;
    .sc-session-container { @apply flex-row justify-between items-center gap-8; }
    .sc-avatar { @apply w-8 h-8; }
    .sc-loggedinas { @apply hidden; }
    .sc-globalname { @apply text-base; }
  }
}
</style>