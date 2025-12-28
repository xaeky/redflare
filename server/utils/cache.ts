import { createStorage } from 'unstorage';
import lruDriver from 'unstorage/drivers/lru-cache';

export default createStorage({
  driver: lruDriver({
    max: 1000,
    ttl: 10 * 60 * 1000 // 10 minutes
  })
});