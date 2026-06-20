import mongoose from 'mongoose';
import User from './models/User.js';

console.log('Connecting to DB...');
await mongoose.connect('mongodb://127.0.0.1:27017/pustakmaza');
console.log('Connected!');

try {
  const email = `test_${Date.now()}@example.com`;
  console.log(`Attempting to create user with email: ${email}`);
  const user = await User.create({
    name: 'Test User',
    email: email,
    password: 'password123',
    role: 'customer'
  });
  console.log('User created successfully:', user);
} catch (error) {
  console.error('Error during User.create:', error);
}

await mongoose.disconnect();
console.log('Disconnected!');
