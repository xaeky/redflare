import { ofetch as o } from 'ofetch';

export default defineEventHandler(async (event) => {
  const mongo = await useMongo();
  const runtime = useRuntimeConfig(event);
  const databases = await mongo.db('admin').admin().listDatabases();
  const outboundIp = (await o('https://icanhazip.com')).trim().replace(/\\n/, '');
  const connected = (await mongo.db('admin').command({ ping: 1 })).ok === 1;
  return {
    db: {
      connected,
    },
    redflare: {
      outbound_ip: outboundIp
    }
  }
});