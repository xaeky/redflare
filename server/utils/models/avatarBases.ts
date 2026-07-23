import { ObjectId, WithoutId } from 'mongodb';
import { AvatarBaseFlagsType } from '~~/shared/enums/Commissions';

const collectionName = 'avatar_bases';

const getAll = async (excludeFlags:AvatarBaseFlagsType = 0) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  const query = excludeFlags ? { flags: { $bitsAllClear: excludeFlags } } : {};
  return collection.find(query).toArray();
};

const insertOne = async (data: AvatarBaseInsertOptions) => {
  const collection = await useMongoCollection<AvatarBase>(collectionName);
  const newData: WithoutId<AvatarBase> = {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return await collection.insertOne(newData as AvatarBase);
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

const getAllCached = defineCachedFunction(async (excludeFlags:AvatarBaseFlagsType = 0) => await getAll(excludeFlags), {
  name: 'avatar_bases_getAll',
  maxAge: 60 * 30, // 30 minutes
  getKey: (excludeFlags:AvatarBaseFlagsType) => `default:${excludeFlags}`
});

export const useAvatarBasesModel = () => ({
  getAll,
  getAllCached,
  insertOne,
  updateOne,
  deleteOne
});