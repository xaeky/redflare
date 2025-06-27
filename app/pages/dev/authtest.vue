<script setup lang="ts">
const { session, clear } = useUserSession();
const redirectLogin = () => { navigateTo('/api/auth/auth0', { external: true }) };
const userInfo = ref();
const permInfo = ref();

async function handleGetUser() {
  const res = await useAPI('/api/auth/whoami');
  userInfo.value = res.data;
}

async function handleGetPerms() {
  const res = await useAPI('/api/auth/permissions');
  permInfo.value = res.data;
}
</script>

<template>
  <DevOnly>
    <h1>DebugSession</h1>
    <h2>Session Actions</h2>
    <UButton label="Authenticate" @click="redirectLogin" />
    <UButton label="Clear Session" @click="clear" color="error" />
    <h2>Session</h2>
    <pre v-text="session" />
    <div class="grid grid-cols-2 gap-8">
      <div>
        <h2>User Info</h2>
        <UButton label="Get User Info" @click="handleGetUser" />
        <pre v-text="userInfo" />
      </div>
      <div>
        <h2>Permissions Info</h2>
        <UButton label="Get User Permissions" @click="handleGetPerms" />
        <pre v-text="permInfo" />
      </div>
    </div>
  </DevOnly>
</template>