import mongoose from 'mongoose';
import User from '../models/User';

const seedAdminUser = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const email = process.env.ADMIN_EMAIL || 'admin@tasksplitter.com';
      const password = process.env.ADMIN_PASSWORD || 'Admin@TaskSplitter2026!';
      
      const admin = new User({
        email,
        password,
      });
      await admin.save();
      console.log(`👤 Admin user seeded in DB: ${email}`);
    } else {
      console.log('👤 Admin user already exists in DB');
    }
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
  }
};

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await seedAdminUser();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

export default connectDB;
