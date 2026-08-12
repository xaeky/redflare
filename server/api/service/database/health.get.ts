export default defineEventHandler(async () => {
  const mongo = await useMongo();
  const outboundIp = (await (await fetch('https://icanhazip.com')).text())
    .trim()
    .replace(/\n/, '');
  const connected = (await mongo.db('admin').command({ ping: 1 })).ok === 1;
  return {
    db: {
      connected,
    },
    redflare: {
      outbound_ip: outboundIp,
    },
  };
});
