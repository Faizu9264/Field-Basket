import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set in environment variables");

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  if (!client) {
  client = new MongoClient(uri!);
    await client.connect();
  }
  db = client.db();
  return db;
}
