import { join } from 'node:path';
import { consola } from 'consola';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is not set');
const logger = consola.create({
  defaults: { tag: 'db:rollback' },
});

const count = parseInt(process.argv[2] ?? '0', 10);
if (count === 0) {
  logger.info('Nothing to roll back.');
  process.exit(0);
}

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db();
const migrationsCollection = db.collection('migrations');

const toRollback = await migrationsCollection
  .find()
  .sort({ appliedAt: -1 })
  .limit(count)
  .toArray();

if (toRollback.length === 0) {
  logger.info('No migrations to roll back.');
  await client.close();
  process.exit(0);
}

for (const migration of toRollback) {
  logger.info(`Rolling back: ${migration.name}`);
  const mod = await import(join(import.meta.dir, 'migrations', migration.name));
  await mod.down(db);
  await migrationsCollection.deleteOne({ name: migration.name });
  logger.success(`Rolled back: ${migration.name}`);
}

await client.close();
