import { MongoClient, Db, ServerApiVersion } from 'mongodb';
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

export const useMongoCollection = async (collectionName: string, event?: H3Event) => {
  if (!db) {
    const mongoClient = await useMongo(event);
    db = mongoClient.db('app');
  }
  return db.collection(collectionName);
}