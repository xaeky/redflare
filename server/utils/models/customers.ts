import { ObjectId } from 'mongodb';
import _ from 'lodash';

type CustomerGetAllParams = { page: number; pageSize?: number; filters: Partial<CustomerFilterOptions>, sort?: { by: string; order: 1 | -1 } };
const getAll = async ({ page, pageSize = 50, filters, sort }: CustomerGetAllParams) => {
  const collection = await useMongoCollection('customers');
  const skip = (page - 1) * pageSize;

  // Prepare filters
  filters ||= {};
  const filterObject: Record<string, any> = {};
  if (filters.name) filterObject.name = { $regex: new RegExp(_.escapeRegExp(filters.name), 'i') };
  if (filters.vrc_id) filterObject.vrc_id = { $regex: new RegExp(_.escapeRegExp(filters.vrc_id), 'i') };
  if (filters.note) filterObject.note = { $regex: new RegExp(_.escapeRegExp(filters.note), 'i') };
  
  // Prepare sort, default sort is created_at desc
  sort ||= { by: 'created_at', order: 1 };
  let sortStage: Record<string, 1 | -1>;
  if (sort.by === 'name') {
    // Case-insensitive sort for name
    sortStage = { lowerName: sort.order };
  } else {
    sortStage = { [sort.by]: sort.order };
  }

  // Prepare pipeline
  const pipelineObject: Record<string, any>[] = [
    { $match: filterObject },
    ...(sort.by === 'name' ? [
      { $addFields: { lowerName: { $toLower: "$name" } } },
      { $project: { lowerName: 0 } }
    ] : []),
    { $sort: sortStage },
    { $skip: skip },
    { $limit: pageSize },
  ];

  return await collection.aggregate(pipelineObject).toArray();
}

const getById = async (id: string) => {
  const collection = await useMongoCollection('customers');
  const result = await collection.findOne({ _id: new ObjectId(id) });
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Customer not found' });
  return result;
}

const getByTelegramId = async (telegramId: string) => {
  const collection = await useMongoCollection<Customer>('customers');
  const result = await collection.findOne({ telegram_id: telegramId });
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Customer not found' });
  return result;
}

const insertOne = async (dataInput: CustomerInsertOptions) => {
  const collection = await useMongoCollection('customers');
  // Initialize customer data with defaults
  const data: Customer = {
    ...dataInput,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return await collection.insertOne(data);
}

const updateOne = async (id: string, data: CustomerUpdateOptions) => {
  const collection = await useMongoCollection('customers');
  (data as Customer).updated_at = new Date().toISOString();
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  return result;
}

const deleteOne = async (id: string) => {
  const collection = await useMongoCollection('customers');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export const useCustomerModel = () => ({
  getAll,
  getById,
  getByTelegramId,
  insertOne,
  updateOne,
  deleteOne
});