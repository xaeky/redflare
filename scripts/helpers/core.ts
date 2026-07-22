import { isCancel, select, text, log } from '@clack/prompts';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dir, '../../');
const DEFAULT_ENVIRONMENT: HelperEnvironment = {
  database: {
    uri: ''
  }
};

export interface HelperEnvironment {
  database: {
    uri: string;
  }
}

interface HelpersUtilsCache {
  environments: Record<string, HelperEnvironment>
}

const logger = log;

function getCachePath() {
  return join(PROJECT_ROOT, '.data/utils-cache.json');
}

async function initCache() {
  const cacheData:HelpersUtilsCache = {
    environments: {
      [process.env.NODE_ENV || 'development']: generateEnvironment()
    }
  };
  await Bun.write(getCachePath(), JSON.stringify(cacheData));
}

async function useCache() {
  // Verify if cache exists
  if (!(await Bun.file(getCachePath()).exists())) {
    logger.warn('Cache not found, initializing...');
    await initCache();
  }
  const cacheData: HelpersUtilsCache = JSON.parse(await Bun.file(getCachePath()).text());
  async function set(newData: HelpersUtilsCache) {
    await Bun.write(getCachePath(), JSON.stringify(newData));
  }
  async function update() {
    const newData = cacheData;
    await set(newData);
  }
  return { cacheData, set, update };
}

function generateEnvironment(data?: HelperEnvironment): HelperEnvironment {
  return data || DEFAULT_ENVIRONMENT;
}

async function initEnvironment(environmentName: string) {
  const cache = await useCache();
  cache.cacheData.environments[environmentName] = generateEnvironment();
  await cache.update();
}

export async function useEnvironments() {
  const cache = await useCache();
  const environments = cache.cacheData.environments;
  if (environments && Object.keys(environments).length === 0) {
    logger.warn('No environments found in cache, initializing default environment...');
    await initEnvironment('development');
  }
  async function add(environmentName: string, data?: HelperEnvironment) {
    environments[environmentName] = generateEnvironment(data);
    await cache.update();
  }
  async function remove(environmentName: string) {
    delete environments[environmentName];
    await cache.update();
  }
  return { environments, add, remove };
}

export async function useEnvironment(environmentName: string) {
  const environments = await useEnvironments();
  if (!environments.environments[environmentName]) {
    logger.warn(`Environment "${environmentName}" not found, initializing...`);
    await initEnvironment(environmentName);
  }
  return environments.environments[environmentName];
}

async function manageEnvironmentMenu(environmentName: string) {
  const thisEnvironment = await useEnvironment(environmentName);
  const actions = {
    view: async () => {
      logger.info(JSON.stringify(thisEnvironment, null, 2));
    },
    edit: async () => {
      Bun.spawn(['code', getCachePath()]);
    },
    destroy: async () => {
      const environments = await useEnvironments();
      await environments.remove(environmentName);
      logger.info(`Environment "${environmentName}" destroyed.`);
    }
  }
  const action = await select({
    message: `Manage environment "${environmentName}":`,
    options: [
      { value: 'view', label: 'View Data' },
      { value: 'edit', label: 'Edit Data' },
      { value: 'destroy', label: 'Destroy Environment' },
      { value: 'databaseSetURI', label: 'Set Database URI' },
    ]
  });

  if (isCancel(action)) return selectEnvironmentMenu();

  actions[action as keyof typeof actions]();
}

export async function selectEnvironmentMenu(backMenu?: () => Promise<void>): Promise<string | symbol | null | void> {
  const environments = await useEnvironments();
  const environmentNames = Object.keys(environments.environments);
  const selectedEnvironment = await select({
    message: 'Select an environment:',
    options: [
      ...environmentNames.map((env) => ({ value: env, label: env })),
      {
        label: 'Create New Environment',
        value: 'createNew'
      }
    ]
  });
  if (backMenu && isCancel(selectedEnvironment)) return backMenu();
  if (selectedEnvironment === 'createNew') {
    const newEnvironmentName = await text({
      message: 'Enter the name for the new environment:',
      placeholder: 'e.g., staging, production'
    });
    if (isCancel(newEnvironmentName)) return selectEnvironmentMenu();
    await initEnvironment(newEnvironmentName);
    logger.info(`Environment "${newEnvironmentName}" created.`);
    return newEnvironmentName;
  }
  return selectedEnvironment;
}