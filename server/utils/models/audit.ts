const collectionName = 'audit';

type AuditGetAllParams = {
  page?: number;
  pageSize?: number;
  filters: Partial<Audit>;
  sort?: { by: string; order: 1 | -1 };
}

const getAll = async ({ page, pageSize = 50, filters, sort }: AuditGetAllParams) => {
  const collection = await useMongoCollection<Audit>(collectionName);
  page ||= 1;
  const skip = (page - 1) * pageSize;

  filters ||= {};
  const filterObject: Record<string, any> = { ...filters };

  sort ||= { by: 'created_at', order: 1 };
  const sortStage: Record<string, 1 | -1> = { [sort.by]: sort.order };

  const data = await collection.find(filterObject).sort(sortStage).skip(skip).limit(pageSize).toArray();
  const total = await collection.countDocuments(filterObject);
  return { data, total };
};

const insertOne = async (data: AuditInsertOptions) => {
  const collection = await useMongoCollection<Audit>(collectionName);
  const newData = {
    ...data,
    created_at: new Date().toISOString(),
  } as Audit;
  return await collection.insertOne(newData);
};

export const useAuditModel = () => ({
  getAll,
  insertOne,
});

