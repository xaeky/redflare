export default defineNuxtPlugin(async (nuxtApp) => {
  if (!nuxtApp.payload.serverRendered) await useRedflarePublicConfig().fetch();
  else if (nuxtApp.payload.prerenderedAt || nuxtApp.payload.isCached) {
    nuxtApp.hook('app:mounted', async () => {
      await useRedflarePublicConfig().fetch();
    });
  }
});
