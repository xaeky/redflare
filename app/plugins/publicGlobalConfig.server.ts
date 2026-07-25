export default defineNuxtPlugin({
  name: 'public-global-config-fetch',
  enforce: 'pre',
  async setup(nuxtApp) {
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt && !nuxtApp.payload.isCached) {
      await useRedflarePublicConfig().fetch();
    }
  }
});