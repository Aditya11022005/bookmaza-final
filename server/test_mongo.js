import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/pustakmaza';

console.log('Connecting to MongoDB...');
try {
  const conn = await mongoose.connect(MONGO_URI);
  console.log(`Connected! Host: ${conn.connection.host}`);
  
  console.log('Creating simple schema and model...');
  const TestSchema = new mongoose.Schema({ name: String });
  const TestModel = mongoose.model('Test', TestSchema);
  
  console.log('Saving a document...');
  await TestModel.create({ name: 'Hello' });
  console.log('Document saved!');
  
  console.log('Querying documents...');
  const docs = await TestModel.find({});
  console.log('Documents:', docs);
  
  await mongoose.disconnect();
  console.log('Disconnected!');
} catch (error) {
  console.error('Error:', error);
}
