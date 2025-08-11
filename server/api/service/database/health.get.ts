import { ofetch as o } from 'ofetch';

export default defineEventHandler(async (event) => {
  const mongo = await useMongo();
  const runtime = useRuntimeConfig(event);
  const dbName = runtime.backoffice.mongoDb;
  const databases = await mongo.db('admin').admin().listDatabases();
  const dbExists = databases.databases.some(db => db.name === dbName);
  const outboundIp = (await o('https://icanhazip.com')).trim().replace(/\\n/, '');
  const connected = (await mongo.db('admin').command({ ping: 1 })).ok === 1;
  return {
    db: {
      name: dbName,
      connected,
      exists: dbExists
    },
    redflare: {
      outbound_ip: outboundIp
    }
  }
});