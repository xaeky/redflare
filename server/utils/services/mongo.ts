import { MongoClient, Db, ServerApiVersion, Document } from 'mongodb';
import type { H3Event } from 'h3';

let client:  MongoClient | null = null;
let db: Db | null = null;

export const useMongo = async (event?: H3Event) => {
  if (!client) {
    const runtime = useRuntimeConfig(event);
    client = new MongoClient(runtime.backoffice.mongo);
    await client.connect();
  }
  return client;
}

export const useMongoCollection = async <T extends Document>(collectionName: string, event?: H3Event) => {
  if (!db) {
    const mongoClient = await useMongo(event);
    db = mongoClient.db();
  }
  return db.collection<T>(collectionName);
}