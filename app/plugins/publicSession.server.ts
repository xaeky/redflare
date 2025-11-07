export default defineNuxtPlugin({
  name: 'public-session-fetch',
  enforce: 'pre',
  async setup(nuxtApp) {
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt && !nuxtApp.payload.isCached) {
      await usePublicUserSession().fetch();
    }
  }
})