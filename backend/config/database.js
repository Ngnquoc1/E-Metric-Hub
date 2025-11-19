import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not configured - AI chatbot features will be disabled');
      return false;
    }

    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected:', conn.connection.host, conn.connection.name);
    
    mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    });

    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Server will continue without database - AI chatbot features disabled');
    return false;
  }
};