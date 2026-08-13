<script setup lang="ts">
const { isLoggedIn, clear } = usePublicUserSession();

async function handleLogout() {
  await clear();
  navigateTo('/', { replace: true });
}

onMounted(() => {
  if (!isLoggedIn.value) navigateTo('/', { replace: true });
});

definePageMeta({
  title: 'Unregistered Account',
});
</script>

<template>
  <div class="h-full flex items-center justify-center flex-col gap-4">
    <div class="bg-error/15 rounded-full p-4 inline-flex">
      <UIcon name="i-ic-baseline-error-outline" class="text-error w-8 h-8" />
    </div>
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">You are not registered</h1>
      <p class="text-muted">
        If you think this is a mistake, try logging out and logging back in or
        contact us.
      </p>
    </div>
    <div>
      <UButton
        label="Log out"
        color="neutral"
        variant="outline"
        size="xl"
        icon="i-ic-baseline-logout"
        @click="handleLogout"
      />
    </div>
  </div>
</template>
