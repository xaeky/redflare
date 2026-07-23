import { createStorage } from 'unstorage';
import lruDriver from 'unstorage/drivers/lru-cache';

export default createStorage({
  driver: lruDriver({
    max: 1000,
    ttl: 10 * 60 * 1000 // 10 minutes
  })
});

export const invalidateHandlerCache = async (name: string, key: string) => {
  await useStorage('cache').removeItem(`nitro:handlers:${name}:${key}.json`);
  logger.withTag('cache').debug(`Invalidated handler cache for key: ${name}:${key}`);
}

export const invalidateFunctionCache = async (name: string, key: '*' | string) => {
  if (key === '*') {
    const keysToDelete = await useStorage('cache').getKeys(`nitro:functions:${name}`);
    for (const key of keysToDelete) await useStorage('cache').removeItem(key);
    logger.withTag('cache').debug(`Invalidated all keys for function cache: ${name}`);
    return;
  }
  await useStorage('cache').removeItem(`nitro:functions:${name}:${key}.json`);
  logger.withTag('cache').debug(`Invalidated function cache for key: ${name}:${key}`);
}