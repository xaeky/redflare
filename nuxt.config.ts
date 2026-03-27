import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  devtools: { enabled: false },
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
    '@nuxt/test-utils/module',
    'nuxt-mcp-dev',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@nuxt/image'
  ],
  css: ['~/assets/global.css'],
  devServer: {
    port: parseInt(process.env.NUXT_PORT as string) || 3000,
  },
  vite: {
    plugins: [require('vite-svg-loader')()],
    server: {
      allowedHosts: ['local.xavis.redflare']
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
    },
    frontoffice: {
      oauth: {
        discord: {
          clientId: '',
          clientSecret: '',
          redirectUrl: ''
        }
      },
      sessionPassword: ''
    },
    bucket: {
      name: '',
      auth: ''
    }
  }
})