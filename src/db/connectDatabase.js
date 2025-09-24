import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connection successfully');
  } catch (error) {
    console.log(`Database connection failed: ${error?.message}`);
    throw error;
  }
};

export default connectDatabase;
