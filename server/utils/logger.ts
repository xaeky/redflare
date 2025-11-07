import { consola } from 'consola';

const logger = consola.create({
  level: process.env.NODE_ENV === 'production' ? 3 : 5,
  defaults: {
    tag: 'API'
  }
});

export default logger;