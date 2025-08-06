import { ObjectId, WithId } from 'mongodb';
import _ from 'lodash';

type CommissionGetAllParams = { page: number; pageSize?: number; filters: Partial<CommissionFilterOptions>, sort?: { by: string; order: 1 | -1 } };
const getAll = async ({ page, pageSize = 50, filters, sort }: CommissionGetAllParams) => {
  const collection = await useMongoCollection('commissions');
  const skip = (page - 1) * pageSize;

  // Prepare filters
  filters ||= {};
  const filterObject: Record<string, any> = {};
  if (filters.customer_id) filterObject.customer_id = new ObjectId(filters.customer_id);
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

const getCharactersByCommissionId = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const commission = await collection.findOne({ oid: commissionId }, { projection: { characters: 1 } });
  if (!commission) return [];
  return commission.characters || [];
}

export const useCommissionModel = () => ({
  getAll,
  getCharactersByCommissionId
});
