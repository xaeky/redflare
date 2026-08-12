import type { Db } from 'mongodb';

const collectionNames = {
  account: 'agent_accounts',
  credentials: 'agent_credentials'
};

export async function up(db: Db) {
  // Create the agent_accounts collection if it doesn't exist
  const existingAccounts = await db.listCollections({ name: collectionNames.account }).toArray();
  if (existingAccounts.length === 0) await db.createCollection(collectionNames.account);
  const collectionAccounts = db.collection(collectionNames.account);
  await collectionAccounts.createIndex({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
  // Create the agent_credentials collection if it doesn't exist
  const existingCreds = await db.listCollections({ name: collectionNames.credentials }).toArray();
  if (existingCreds.length === 0) await db.createCollection(collectionNames.credentials);
}

export async function down(db: Db) {
  // Drop the agent_accounts collection and its index if it exists
  const collectionAccounts = db.collection(collectionNames.account);
  await collectionAccounts.dropIndex('username_1').catch(() => {});
  const existingAccounts = await db.listCollections({ name: collectionNames.account }).toArray();
  if (existingAccounts.length > 0) await db.collection(collectionNames.account).drop();
  // Drop the agent_credentials collection if it exists
  const existingCreds = await db.listCollections({ name: collectionNames.credentials }).toArray();
  if (existingCreds.length > 0) await db.collection(collectionNames.credentials).drop();
}
