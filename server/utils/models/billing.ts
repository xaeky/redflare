import { ObjectId } from 'mongodb';

const collectionName = 'billing_transactions';

const getAll = async () => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  return collection.find().toArray();
};

const getByCommission = async (commissionId: string) => {
  const commissionsCollection = await useMongoCollection<CommissionBase>('commissions');
  const commission = await commissionsCollection.findOne({ _id: new ObjectId(commissionId) });
  if (!commission) return [];
  const paymentIds = commission.payments.map((p: string) => new ObjectId(p));
  const paymentsCollection = await useMongoCollection<PaymentTransaction>(collectionName);
  const payments = await paymentsCollection.find({ _id: { $in: paymentIds } }).toArray();
  return payments;
}

const insertOne = async (options: PaymentTransactionOptions) => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  const newData: PaymentTransaction = {
    ...options,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return await collection.insertOne(newData);
};

const updateOne = async (id: string, data: Partial<PaymentTransaction>) => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  (data as PaymentTransaction).updated_at = new Date().toISOString();
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  return result;
};

const deleteOne = async (id: string) => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export const useBillingModel = () => ({
  getAll,
  getByCommission,
  insertOne,
  updateOne,
  deleteOne
});