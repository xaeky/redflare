import { ObjectId, WithId } from 'mongodb';
import _ from 'lodash';

type CommissionGetAllParams = { page: number; pageSize?: number; filters: Partial<CommissionFilterOptions>, sort?: { by: string; order: 1 | -1 } };
const getAll = async ({ page, pageSize = 50, filters, sort }: CommissionGetAllParams) => {
  const collection = await useMongoCollection('commissions');
  const skip = (page - 1) * pageSize;

  // Prepare filters
  filters ||= {};
  const filterObject: Record<string, any> = {};
  if (filters.customer) filterObject.customer = new ObjectId(filters.customer);
  if (filters.status) filterObject.status = filters.status;
  
  // Prepare sort, default sort is created_at desc
  sort ||= { by: 'created_at', order: 1 };
  let sortStage: Record<string, 1 | -1> = { [sort.by]: sort.order };

  // Prepare pipeline
  const pipelineObject: Record<string, any>[] = [
    { $match: filterObject },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    { $project: { characters: 0 } },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: pageSize },
  ];
  return await collection.aggregate(pipelineObject).toArray() as WithId<WithCustomer<CommissionBase>>[];
}

const getOneById = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const commission = await collection.aggregate([
    { $match: { _id: new ObjectId(commissionId) } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
  ]).next();

  if (_.isEmpty(commission)) return null;
  if (!commission) return null;
  return commission as WithId<WithCharacters<WithExistingCustomer<CommissionBase>>>;
}

const getCharactersByCommissionId = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const commission = await collection.findOne({ _id: new ObjectId(commissionId) }, { projection: { characters: 1 } });
  if (!commission) return [];
  return commission.characters || [];
}

const updateOne = async (commissionId: string, updateData: CommissionUpdate) => {
  const collection = await useMongoCollection('commissions');
  // Correct customer field if it's a string
  if (updateData.customer && typeof updateData.customer === 'string') {
    updateData.customer = new ObjectId(updateData.customer);
  }
  // Correct base field for characters
  if (updateData.characters) {
    updateData.characters = updateData.characters.map(character => {
      const sanitizedCharacter = character;
      // Ensure base is an ObjectId
      sanitizedCharacter.base = new ObjectId(character.base as string);
      return sanitizedCharacter;
    });
  }
  const result = await collection.updateOne(
    { _id: new ObjectId(commissionId) },
    { $set: updateData }
  );

  return result;
}

const insertOne = async (data: CommissionOptions) => {
  const collection = await useMongoCollection('commissions');
  // Ensure customer is an ObjectId
  if (data.customer && typeof data.customer === 'string') {
    data.customer = new ObjectId(data.customer);
  }
  // Ensure characters have base as ObjectId
  if (data.characters) {
    data.characters = data.characters.map(character => {
      const sanitizedCharacter = character;
      // Ensure base is an ObjectId
      sanitizedCharacter.base = new ObjectId(character.base as string);
      return sanitizedCharacter;
    });
  }
  
  // Initialize commission data with defaults
  const commissionData: CommissionBase = {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return await collection.insertOne(commissionData);
}

const deleteOne = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const result = await collection.deleteOne({ _id: new ObjectId(commissionId) });
  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: 'Commission not found' });
  }
  return { success: true };
}

export const useCommissionModel = () => ({
  getAll,
  getOneById,
  getCharactersByCommissionId,
  updateOne,
  insertOne,
  deleteOne
});
