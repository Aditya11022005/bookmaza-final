import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/void/Web/Freelance/Book Maza/server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pustakmaza';

const checkDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Fetch Categories
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log('Categories:', categories);

    // Fetch Books count
    const booksCount = await mongoose.connection.db.collection('books').countDocuments();
    console.log('Total Books Count:', booksCount);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkDb();
