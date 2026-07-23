import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-13',
  devtools: { enabled: false },
  nitro: {
    preset: 'bun',
    imports: {
      dirs: ['server/utils/services', 'server/utils/models'],
    },
    serverAssets: [
      { baseName: 'fonts', dir: 'assets/fonts' },
      { baseName: 'svg', dir: 'assets/svg' },
      { baseName: 'img', dir: 'assets/img' },
    ],
  },
  imports: { dirs: ['shared/enums'], },
  alias: {
    '#models': fileURLToPath(new URL('./server/utils/models', import.meta.url)),
  },
  routeRules: {
    '/api/**': { cors: false },
    '/api/service/**': { cors: true },
    '/api/auth/**': { cors: true },
    '/dashboard/**': { ssr: false },
    '/commission': { redirect: '/me' },
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
  vite: {
    plugins: [require('vite-svg-loader')()],
    server: {
      allowedHosts: ['local.xavis.redflare']
    }
  },
  runtimeConfig: {
    mp: {
      public: '',
      service: '',
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
      legal: {
        serviceUrl: '',
        privacyUrl: ''
      },
      homepageUrl: '',
      help: {
        privateUploadUrl: ''
      }
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
          clientSecret: ''
        }
      },
      sessionPassword: ''
    }
  }
})