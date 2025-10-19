import _ from 'lodash';
import { ObjectId } from 'mongodb';

const collectionName = 'billing_transactions';

const getAll = async () => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  return collection.find().toArray();
};

const getByCommission = async (commissionId: string) => {
  const commissionsCollection = await useMongoCollection<CommissionBase>('commissions');
  const commission = await commissionsCollection.findOne({ _id: new ObjectId(commissionId) }, { projection: { payments: 1 } });
  if (!commission || _.isEmpty(commission.payments)) return [];
  const paymentIds = commission.payments.map((p: string) => new ObjectId(p));
  const paymentsCollection = await useMongoCollection<PaymentTransaction>(collectionName);
  const payments = await paymentsCollection.find({ _id: { $in: paymentIds } }).toArray();
  return payments;
}

const getParentsByTransaction = async (transactionId: string) => {
  const commissionsCollection = await useMongoCollection<CommissionBase>('commissions');
  const commissions = await commissionsCollection.find({ payments: transactionId }, { projection: { _id: 1 } }).toArray();
  return commissions;
}

const insertOne = async (options: PaymentTransactionOptions) => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  // Make sure approved_at is a ISOString
  options.approved_at = new Date(options.approved_at).toISOString();
  const newData: PaymentTransaction = {
    ...options,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return await collection.insertOne(newData);
};

const deleteOne = async (id: string) => {
  const collection = await useMongoCollection<PaymentTransaction>(collectionName);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export const useBillingModel = () => ({
  getAll,
  getByCommission,
  getParentsByTransaction,
  insertOne,
  deleteOne
});