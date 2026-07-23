import { ObjectId, WithId } from 'mongodb';
import _ from 'lodash';
import type { StorageMeta } from 'unstorage';

const CURRENT_SCHEMA_VERSION = 2;

/**
 * Normalizes an attachment ID to the current plain file-ID format (schemaVersion 2+).
 * Handles both the legacy base64-encoded path format (e.g. base64("avatars/1234") → "1234")
 * and the new plain file ID format ("1234").
 * When schemaVersion is already current, the value is passed through without decoding.
 */
const normalizeAttachmentId = (raw: string, schemaVersion?: number): string => {
  if ((schemaVersion ?? 0) >= CURRENT_SCHEMA_VERSION) return raw;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8');
    if (decoded.startsWith('avatars/')) {
      return decoded.slice('avatars/'.length);
    }
  } catch {
    // not valid base64 — already a plain ID
  }
  return raw;
};

type CommissionGetAllParams = {
  page?: number;
  pageSize?: number;
  filters: Partial<CommissionFilterOptions>;
  sort?: { by: string; order: 1 | -1 };
  public?: boolean;
};
const getAll = async ({ page, pageSize = 50, filters, sort, public: publicRequest }: CommissionGetAllParams) => {
  const collection = await useMongoCollection('commissions');
  page ||= 1;
  const skip = (page - 1) * pageSize;

  // Prepare filters
  filters ||= {};
  const filterObject: Record<string, any> = {};
  if (filters.customer) filterObject.customer = new ObjectId(filters.customer);
  if (filters.status) filterObject.status = filters.status;
  
  // Prepare sort, default sort is created_at desc
  sort ||= { by: 'created_at', order: 1 };
  let sortStage: Record<string, 1 | -1> = { [sort.by]: sort.order };

  // Filter project fields
  const projectStage: Record<string, 0 | 1> = { characters: 0 };
  if (publicRequest) {
    // exclude following fields for public requests
    const excludedFields = ['customer', 'payments', 'secure_note'];
    _.each(excludedFields, (field) => {
      projectStage[field] = 0;
    });
  }

  // Prepare main pipeline
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
    { $project: projectStage },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: pageSize },
  ];

  // Prepare separate pipeline for count
  const countPipeline = [
    { $match: filterObject },
    { $count: 'total' }
  ];

  // Execute count pipeline
  const countResult = await collection.aggregate(countPipeline).toArray();
  const total = countResult[0]?.total || 0;

  // Execute main pipeline
  const data = await collection.aggregate(pipelineObject).toArray();
  return { data, total };
}

const getOneById = async (commissionId: string, viewAs?: ViewAs): Promise<SingleCommissionResponse | null> => {
  const collection = await useMongoCollection('commissions');
  const projectStage: Record<string, 0 | 1> = { baseObj: 0 };
  let excludedFields;
  if (viewAs === 'anon') {
    // exclude following fields for public requests
    excludedFields = [
      'customer.note', 'customer._id', 'customer.updated_at', 'customer.created_at', 'customer.telegram_id', 'customer.discord_id',
      'payments', 'characters', 'public_note', 'secure_note'];
  } else if (viewAs === 'customer') {
    // exclude following fields for customer requests
    excludedFields = ['customer.note', 'secure_note'];
  }
  _.each(excludedFields, (field) => {
    projectStage[field] = 0;
  });
  const commissionPipeline: Record<string, any>[] = [
    { $match: { _id: new ObjectId(commissionId) } },
    { $unwind: { path: '$characters', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'avatar_bases',
        let: { baseId: '$characters.base' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$baseId'] } } }
        ],
        as: 'baseObj'
      }
    },
    {
      $addFields: {
        'characters.base': { $arrayElemAt: ['$baseObj', 0] }
      }
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        characters: { $push: '$characters' }
      }
    },
    {
      $addFields: {
        'doc.characters': {
          $cond: [
            { $and: [
              { $eq: [ { $size: '$characters' }, 1 ] },
              { $eq: [ '$characters.0', {} ] }
            ] },
            [],
            {
              $filter: {
                input: '$characters',
                as: 'char',
                cond: { $ne: ['$$char', {}] }
              }
            }
          ]
        }
      }
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $addFields: { payments: { $ifNull: ['$payments', []] } } },
  ];
  if (viewAs === 'anon') {
    // Only get character's count in `locked_fields.characters_count`
    commissionPipeline.push(
      { $addFields: { 'locked_fields.characters_count': { $size: '$characters' } } }
    );
  }
  if (viewAs === 'customer') {
    commissionPipeline.push(
      { $addFields: { payments_obj_ids: { $map: { input: '$payments', as: 'p', in: { $toObjectId: '$$p' } } } } },
      {
        $lookup: {
          from: 'billing_transactions',
          let: { ids: '$payments_obj_ids' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$ids'] } } },
            { $project: { internal_note: 0 } }
          ],
          as: 'payments'
        }
      },
      { $project: { payments_obj_ids: 0 } }
    );
  }
  commissionPipeline.push({ $project: projectStage });
  const commission = await collection.aggregate<CommissionBaseRaw>(commissionPipeline).next();
  if (!commission || _.isEmpty(commission)) return null;
  const customer = await useCustomerModel().getById(commission.customer.toString() || '');
  // Fetch file details for each attachment of each character changelog, prefix "avatars/" to each attachment ID since that's the path where attachments are stored in the bucket. 
  const fileIds = _.flatMap(commission.characters ?? [], (char) =>
    _.flatMap(char.changelog ?? [], (changelog) => changelog.attachments as string[] ?? [])
  ).map((attachmentId) => `avatars/${normalizeAttachmentId(attachmentId, commission.schemaVersion)}`);
  let filesDetails: Record<string, CommissionCharacterAttachmentRaw> = {};
  if (fileIds.length > 0) filesDetails = await bucketFilesMetadata(fileIds, 'default', true);
  // Rename filesDetails keys, split "avatars/" prefix from each key.
  filesDetails = _.mapKeys(filesDetails, (_, key) => key.replace('avatars/', ''));
  const canViewAttachments = viewAs === 'customer' || viewAs === 'agent';
  let returnData = {
    data: commission,
    attachments: canViewAttachments ? filesDetails : undefined,
    customer: customer
  }
  return returnData;
}

const updateOne = async (commissionId: string, requestData: Partial<CommissionUpdate>) => {
  const collection = await useMongoCollection('commissions');
  const newData:Partial<CommissionUpdate> = {
    ...requestData,
    ...(requestData.customer ? { customer: new ObjectId(requestData.customer as string) } : {}),
    ...(requestData.characters ? { characters: requestData.characters.map(c => {
      const sanitizedCharacter = c;
      // Ensure base is an ObjectId
      sanitizedCharacter.base = new ObjectId(c.base as string);
      // Normalize attachment IDs to current schema format
      sanitizedCharacter.changelog = (c.changelog ?? []).map((log) => ({
        ...log,
        attachments: (log.attachments ?? []).map((id) => normalizeAttachmentId(id)),
      }));
      return sanitizedCharacter;
    }) } : {}),
    updated_at: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  // Remove payments from newData since Billing controller handles it
  if (newData.payments) delete newData.payments;
  const result = await collection.updateOne(
    { _id: new ObjectId(commissionId) },
    { $set: newData }
  );

  return result;
}

const insertOne = async (requestData: CommissionOptions) => {
  const collection = await useMongoCollection('commissions');
  const newData:CommissionInsert = {
    ...requestData,
    customer: new ObjectId(requestData.customer),
    characters: requestData.characters.map(c => {
      const sanitizedCharacter = c;
      // Ensure base is an ObjectId
      sanitizedCharacter.base = new ObjectId(c.base as string);
      return sanitizedCharacter;
    }),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  return await collection.insertOne(newData);
}

const deleteOne = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const result = await collection.deleteOne({ _id: new ObjectId(commissionId) });
  if (result.deletedCount === 0) {
    throw createError({ status: 404, statusText: 'Commission not found' });
  }
  return { success: true };
}

const existsOne = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const result = await collection.findOne({ _id: new ObjectId(commissionId) });
  return !!result;
}

const removeTransactionFromOne = async (commissionId: string, paymentId: string) => {
  const collection = await useMongoCollection('commissions');
  const commission = await collection.findOne({ _id: new ObjectId(commissionId) });
  if (!commission) throw createError({ status: 404, statusText: 'Commission not found' });
  const updatedPayments = (commission.payments || []).filter((pId: string) => pId !== paymentId);
  const result = await collection.updateOne(
    { _id: new ObjectId(commissionId) },
    { $set: { payments: updatedPayments, updated_at: new Date().toISOString() } }
  );
  return result;
}

const addTransactionToOne = async (commissionId: string, paymentId: string) => {
  const collection = await useMongoCollection('commissions');
  const transactionCollection = await useMongoCollection('billing_transactions');
  const transaction = await transactionCollection.findOne({ _id: new ObjectId(paymentId) });
  if (!transaction) throw createError({ status: 404, statusText: 'Payment transaction not found' });
  const commission = await collection.findOne({ _id: new ObjectId(commissionId) });
  if (!commission) throw createError({ status: 404, statusText: 'Commission not found' });
  // Making sure is not already added
  if (commission.payments && commission.payments.includes(paymentId)) {
    throw createError({ status: 400, statusText: 'Payment transaction already linked to this commission' });
  }
  const updatedPayments = Array.from(new Set([...(commission.payments || []), paymentId]));
  const result = await collection.updateOne(
    { _id: new ObjectId(commissionId) },
    { $set: { payments: updatedPayments, updated_at: new Date().toISOString() } }
  );
  return result;
}

const findCustomerByOne = async (commissionId: string) => {
  const collection = await useMongoCollection('commissions');
  const commission = await collection.aggregate([
    { $match: { _id: new ObjectId(commissionId) } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer'
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    { $project: { customer: 1 } }
  ]).next();

  if (!commission) return null;
  return commission.customer as WithId<Customer>;
}

const checkOwnershipFromOne = async (commissionId: string, evalCustomerId: string) => {
  const commissionCustomer = await findCustomerByOne(commissionId);
  if (!commissionCustomer) return false;
  return commissionCustomer._id.toString() === evalCustomerId;
}

const confirmAllAttachmentsFromOne = async (commissionId: string) => {
  const collection = await useMongoCollection<CommissionBaseRaw>('commissions');
  const commission = await collection.findOne({ _id: new ObjectId(commissionId) });
  if (!commission) throw createError({ status: 404, statusText: 'Commission not found' });
  // Attachments in changelogs are stored only as strings (Object ID)
  const allAttachments = _.flatMap(commission.characters ?? [], (char) =>
    _.flatMap(char.changelog ?? [], (changelog) => changelog.attachments as string[] ?? [])
  );
  allAttachments.forEach((attachmentId) => {
    const destinationPath = `avatars/${normalizeAttachmentId(attachmentId, commission.schemaVersion)}`;
    bucketMoveFileToPermanent(destinationPath);
  });
};

const migrateCommissions = async (): Promise<{ migrated: number }> => {
  const collection = await useMongoCollection<CommissionBaseRaw>('commissions');
  const cursor = collection.find({ schemaVersion: { $not: { $gte: CURRENT_SCHEMA_VERSION } } });

  const bulkOps: any[] = [];
  let migrated = 0;

  const flush = async () => {
    if (bulkOps.length === 0) return;
    const result = await collection.bulkWrite(bulkOps.splice(0));
    migrated += result.modifiedCount;
  };

  for await (const doc of cursor) {
    const updatedCharacters = (doc.characters ?? []).map((char) => ({
      ...char,
      changelog: (char.changelog ?? []).map((log) => ({
        ...log,
        attachments: (log.attachments as string[] ?? []).map((id) => normalizeAttachmentId(id, doc.schemaVersion)),
      })),
    }));
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { characters: updatedCharacters, schemaVersion: CURRENT_SCHEMA_VERSION } },
      },
    });
    if (bulkOps.length >= 100) await flush();
  }

  await flush();
  return { migrated };
};

export const useCommissionModel = () => ({
  getAll,
  getOneById,
  existsOne,
  updateOne,
  insertOne,
  deleteOne,
  removeTransactionFromOne,
  addTransactionToOne,
  findCustomerByOne,
  checkOwnershipFromOne,
  confirmAllAttachmentsFromOne,
  migrateCommissions
});
