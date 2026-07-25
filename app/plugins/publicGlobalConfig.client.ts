export default defineNuxtPlugin(async (nuxtApp) => {
  const publicConfigStore = usePublicConfigStore();
  if (!nuxtApp.payload.serverRendered) await publicConfigStore.fetch();
  else if (Boolean(nuxtApp.payload.prerenderedAt) || Boolean(nuxtApp.payload.isCached)) {
    nuxtApp.hook('app:mounted', async () => {
      console.log('Config status', publicConfigStore.isReady, publicConfigStore.configState);
    });
  }
});