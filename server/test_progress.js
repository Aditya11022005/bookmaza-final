import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import progressRoutes from './routes/progressRoutes.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/progress', progressRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmaza')
  .then(async () => {
    console.log('MongoDB Connected');
    
    const user = await User.findOne();
    if (!user) {
      console.log('No user found in DB');
      mongoose.disconnect();
      return;
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log('Running test server on port', port);
      
      try {
        const res = await fetch(`http://localhost:${port}/api/progress/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response body:', data);
      } catch (err) {
        console.error(err);
      }
      
      server.close();
      mongoose.disconnect();
    });
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
