import { MongoClient } from 'mongodb';
import { readdir } from 'node:fs/promises';
import { consola } from 'consola';
import { join } from 'path';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is not set');
const MONGO_HOST = MONGO_URI.split(/@(.*)\//)[1];
const logger = consola.create({
  defaults: { tag: 'redflare:migrate' }
});

logger.info(`Connecting to MongoDB at ${MONGO_HOST}...`);

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db();
const migrationsCollection = db.collection('migrations');

const collections = await db.listCollections({ name: 'migrations' }).toArray();
if (collections.length === 0) await db.createCollection('migrations');

const migrationsDir = join(import.meta.dir, 'migrations');
const files = (await readdir(migrationsDir)).sort();
const applied = new Set((await migrationsCollection.find({}).toArray()).map(m => m.name));
const pending = files.filter(f => !applied.has(f));

if (pending.length === 0) {
  logger.info('No pending migrations.');
} else {
  for (const file of pending) {
    logger.info(`Applying: ${file}`);
    const mod = await import(join(migrationsDir, file));
    await mod.up(db);
    await migrationsCollection.insertOne({ name: file, appliedAt: new Date() });
    logger.success(`Applied: ${file}`);
  }

  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    await Bun.write(ghOutput, `applied_count=${pending.length}\n`);
  }
}

await client.close();