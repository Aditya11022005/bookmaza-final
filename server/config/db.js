import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';

const seedAdmin = async () => {
  try {
    const email = 'admin@pustakmaza.com';
    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      await User.create({
        name: 'Super Admin',
        email,
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('Default Admin Account Seeded: admin@pustakmaza.com / adminpassword123');
    } else {
      adminUser.role = 'admin';
      adminUser.password = 'adminpassword123';
      await adminUser.save();
      console.log('Admin Account Reset/Verified: admin@pustakmaza.com / adminpassword123');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};

const seedCategories = async () => {
  try {
    const count = await Category.countDocuments({});
    if (count === 0) {
      const defaultCategories = [
        { name: 'Fiction', slug: 'fiction' },
        { name: 'Non-Fiction', slug: 'non-fiction' },
        { name: 'Self-Help', slug: 'self-help' },
        { name: 'History', slug: 'history' },
        { name: 'Marathi Literature', slug: 'marathi-literature' },
      ];
      await Category.insertMany(defaultCategories);
      console.log('Default Categories Seeded Successfully!');
    }
  } catch (error) {
    console.error('Error seeding default categories:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
    await seedCategories();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log("Database connection failed. Continuing in offline mode...");
  }
};

export default connectDB;
