import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('--- DATABASES ---');
    console.log(JSON.stringify(dbs, null, 2));
    
    console.log('Current DB name:', mongoose.connection.db.databaseName);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in current DB:');
    for (let col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

run();
