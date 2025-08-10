import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  devtools: { enabled: false },
  future: {
    compatibilityVersion: 4
  },
  nitro: {
    imports: {
      dirs: ['server/utils/services', 'server/utils/models'],
    },
  },
  imports: {
    dirs: ['shared/enums'],
  },
  alias: {
    '#models': fileURLToPath(new URL('./server/utils/models', import.meta.url)),
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@pinia/colada-nuxt'
  ],
  css: ['~/assets/global.css'],
  devServer: {
    https: {
      key: 'localhost-key.pem',
      cert: 'localhost.pem'
    }
  },
  runtimeConfig: {
    mp: {
      public: '', // PublicToken
      service: '', // AccessToken
      marketplace: '',
      endpointBase: ''
    },
    pp: {
      cid: '',
      sid: '',
      endpointBase: ''
    },
    public: {
      creator: {
        marketName: '',
        callbackUri: ''
      },
      env: process.env.NODE_ENV || '',
      redflare_env: '',
    },
    backoffice: {
      skipRoles: false,
      mongo: '',
      mongoDb: '',
      service: ''
    }
  }
})