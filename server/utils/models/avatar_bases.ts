import { ObjectId } from 'mongodb';

const collectionName = 'avatar_bases';

const getAll = async (excludeBlacklisted = false) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  const query = excludeBlacklisted ? { blacklisted: { $ne: true } } : {};
  return collection.find(query).toArray();
};

const insertOne = async (data: AvatarBaseInsertOptions) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  const newData: AvatarBase = {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return await collection.insertOne(newData);
};

const updateOne = async (id: string, data: AvatarBaseUpdateOptions) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  (data as AvatarBase).updated_at = new Date().toISOString();
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  return result;
};

const deleteOne = async (id: string) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export const useAvatarBasesModel = () => ({
  getAll,
  insertOne,
  updateOne,
  deleteOne
});