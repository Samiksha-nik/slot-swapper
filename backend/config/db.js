import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI or MONGODB_URI in environment');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  return mongoose.connection;
}


