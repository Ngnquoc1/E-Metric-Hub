import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected:', conn.connection.host, conn.connection.name);
    mongoose.connection.on('error', err => console.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};