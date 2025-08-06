import { ObjectId, Sort } from 'mongodb';
import { useMongoCollection } from '../services/mongo';
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
  sort ||= { by: 'created_at', order: -1 };
  const sortObject: [string, 1 | -1][] = [[sort.by, sort.order]];
  // Exec query
  return await collection.find(filterObject).sort(sortObject).skip(skip).limit(pageSize).toArray();
}

const getById = async (id: string) => {
  const collection = await useMongoCollection('customers');
  const result = await collection.findOne({ _id: new ObjectId(id) });
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
  insertOne,
  updateOne,
  deleteOne
});