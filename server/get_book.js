import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://adityalife11022005_db_user:SPglk4CscqRcyks4@cluster0.kxl45hl.mongodb.net/pustakmaza?retryWrites=true&w=majority';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    const booksCol = db.collection('books');
    
    const book = await booksCol.findOne({ _id: new mongoose.Types.ObjectId('6a3979684ac2f40a7536227') });
    console.log('BOOK DETAILS:', JSON.stringify(book, null, 2));
    
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
