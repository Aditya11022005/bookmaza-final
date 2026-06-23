import { MongoClient } from 'mongodb';
const uri = "mongodb://127.0.0.1:27017/pustakmaza";
console.log("Connecting...");
try {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  console.log("Connected successfully!");
  await client.close();
} catch (e) {
  console.error("Failed to connect:", e);
}
