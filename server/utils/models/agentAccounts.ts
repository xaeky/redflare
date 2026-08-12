import _ from 'lodash';
import { ObjectId } from 'mongodb';

const collectionAccountsName = 'agent_accounts';
const collectionCredentialsName = 'agent_credentials';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getAll = async () => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  return collection.find().sort({ createdAt: 1 }).toArray();
};

const countAll = async () => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  return collection.countDocuments();
};

const getById = async (id: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const result = await collection.findOne({ _id: new ObjectId(id) });
  if (!result)
    throw createError({ status: 404, statusText: 'Account not found' });
  return result;
};

const getByUsername = async (username: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const result = await collection.findOne({
    username: { $regex: new RegExp(`^${_.escapeRegExp(username)}$`, 'i') },
  });
  return result;
};

const insertOne = async ({
  username,
  password,
  displayName,
  permissions,
}: AgentAccountInsertOptions) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const existing = await getByUsername(username);
  if (existing)
    throw createError({ status: 409, statusText: 'Username is already taken' });
  const passwordHash = await Bun.password.hash(password, {
    algorithm: 'argon2id',
  });
  const now = new Date().toISOString();
  const data: Omit<AgentAccount, '_id'> = {
    username,
    passwordHash,
    displayName: displayName || null,
    permissions: permissions || [],
    settings: {},
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  };
  return await collection.insertOne(data as AgentAccount);
};

const updateOne = async (id: string, data: AgentAccountUpdateOptions) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
  );
  return result;
};

const updatePassword = async (id: string, newPassword: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const passwordHash = await Bun.password.hash(newPassword, {
    algorithm: 'argon2id',
  });
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date().toISOString() } },
  );
  return result;
};

const deleteOne = async (id: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing)
    throw createError({ status: 404, statusText: 'Account not found' });
  const total = await countAll();
  if (total <= 1)
    throw createError({
      status: 400,
      statusText: 'Cannot delete the last remaining account',
    });
  return await collection.deleteOne({ _id: new ObjectId(id) });
};

const verifyPassword = async (account: AgentAccountRaw, password: string) => {
  return await Bun.password.verify(password, account.passwordHash);
};

const isLockedOut = (account: AgentAccountRaw) => {
  return (
    !!account.lockedUntil &&
    new Date(account.lockedUntil).getTime() > Date.now()
  );
};

const recordFailedLogin = async (id: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  const account = await collection.findOne({ _id: new ObjectId(id) });
  if (!account) return;
  const failedLoginAttempts = (account.failedLoginAttempts || 0) + 1;
  const shouldLock = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        failedLoginAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
          : account.lockedUntil,
        updatedAt: new Date().toISOString(),
      },
    },
  );
};

const resetFailedLogins = async (id: string) => {
  const collection = await useMongoCollection<AgentAccountRaw>(
    collectionAccountsName,
  );
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date().toISOString(),
      },
    },
  );
};

const recordPasskeyCredential = async (
  credential: AgentAccountPasskeyCredential,
) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  await collection.insertOne(credential);
};

const listPasskeyCredentialsForAccount = async (accountId: string) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  return await collection.find({ belongsTo: accountId }).toArray();
};

const getPasskeyCredentialById = async (credentialId: string) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  return await collection.findOne({ id: credentialId });
};

const deletePasskeyCredential = async (
  accountId: string,
  credentialId: string,
) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  await collection.deleteOne({ id: credentialId, belongsTo: accountId });
};

const setPasskeyCounter = async (credentialId: string, newCounter: number) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  await collection.updateOne(
    { id: credentialId },
    { $set: { counter: newCounter } },
  );
};

const recordPasskeyLastUsage = async (credentialId: string) => {
  const collection = await useMongoCollection<AgentAccountPasskeyCredential>(
    collectionCredentialsName,
  );
  await collection.updateOne(
    { id: credentialId },
    { $set: { lastUsedAt: new Date().toISOString() } },
  );
};

export const useAgentAccountsModel = () => ({
  getAll,
  countAll,
  getById,
  getByUsername,
  insertOne,
  updateOne,
  deleteOne,
  // Auth
  updatePassword,
  verifyPassword,
  isLockedOut,
  recordFailedLogin,
  resetFailedLogins,
  // Passkeys
  recordPasskeyCredential,
  listPasskeyCredentialsForAccount,
  getPasskeyCredentialById,
  deletePasskeyCredential,
  setPasskeyCounter,
  recordPasskeyLastUsage,
});
