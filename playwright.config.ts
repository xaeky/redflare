import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import type { ConfigOptions } from '@nuxt/test-utils/playwright';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.test'], quiet: true });
const TEST_URL = process.env.TEST_URL || 'https://localhost:3000';
const LOCAL_HOSTS = ['local.xavis', 'localhost', '127.0.0.1'];
const isRemote = !!process.env.FORCE_REMOTE || !LOCAL_HOSTS.some(host => TEST_URL.includes(host));

export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  reporter: 'html',
  timeout: 60 * 1000 * 5, // 5 minutes 
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      build: false,
      host: TEST_URL
    },
    baseURL: TEST_URL,
    ignoreHTTPSErrors: true,
    colorScheme: 'dark',
  },
  projects: [
    { use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: isRemote ? [] : [
    {
      command: 'bun dev',
      url: TEST_URL,
      wait: {
        stdout: /Nitro server built/,
      },
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});
