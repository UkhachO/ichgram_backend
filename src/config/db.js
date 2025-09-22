import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  if (!config.mongoUri) throw new Error('MONGO_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB Atlas connected');
};

export default connectDB;
