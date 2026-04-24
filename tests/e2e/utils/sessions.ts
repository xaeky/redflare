import type { Page } from "playwright-core";

const endpoints = {
  agent: '/api/test/agent/claimSession',
  public: '/api/test/public/claimSession'
};
const redirects = {
  agent: /\/dashboard/,
  public: /\/me/
};

export const claimSession = async (page: Page, type: 'agent' | 'public') => {
  await page.goto(endpoints[type]);
  await page.waitForURL(redirects[type]);
}

export const getRedirectUrl = (type: 'agent' | 'public') => {
  return redirects[type];
}