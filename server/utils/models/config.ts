import type { UpdateResult } from 'mongodb';

const collectionName = 'config';

async function getAll(): Promise<RedflareConfig[]> {
  const collection = await useMongoCollection<RedflareConfig>(collectionName);
  return collection.find().toArray();
}

async function getByCategory (category: RedflareConfigCategory): Promise<RedflareConfig | null> {
  const collection = await useMongoCollection<RedflareConfig>(collectionName);
  return collection.findOne({ category });
};

async function setByCategory (category: RedflareConfigCategory, config: RedflareConfig): Promise<UpdateResult<RedflareConfig>> {
  const collection = await useMongoCollection<RedflareConfig>(collectionName);
  const result = await collection.updateOne(
    { category },
    { $set: config },
    { upsert: true }
  );
  return result;
};

export const useConfigModel = () => ({
  getAll,
  getByCategory,
  setByCategory
});
