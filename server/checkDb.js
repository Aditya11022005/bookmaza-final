import connectDB from './config/db.js';
import User from './models/User.js';
import Book from './models/Book.js';
import Order from './models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const orderCount = await Order.countDocuments();
    console.log('--- DATABASE STATS ---');
    console.log('Total Users:', userCount);
    console.log('Total Books:', bookCount);
    console.log('Total Orders:', orderCount);
    
    console.log('--- USERS LIST ---');
    const users = await User.find({}, 'name email role isAuthorApproved');
    console.log(users);
    
    console.log('--- BOOKS LIST ---');
    const books = await Book.find({}, 'title isPublished authorName');
    console.log(books);
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

run();
