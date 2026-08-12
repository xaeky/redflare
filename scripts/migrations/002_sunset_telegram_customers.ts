import type { Db } from 'mongodb';

export async function up(db: Db) {
  const collection = db.collection('customers');

  // Remove telegram_id field from all documents
  await collection.updateMany(
    { telegram_id: { $exists: true } },
    { $unset: { telegram_id: '' } },
  );
}

export async function down(db: Db) {
  const collection = db.collection('customers');

  // Add telegram_id field back to all documents with a default value of null
  await collection.updateMany(
    { telegram_id: { $exists: false } },
    { $set: { telegram_id: null } },
  );
}
