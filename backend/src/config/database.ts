import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI tanımlı değil');
    }
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log('✅ MongoDB bağlandı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

export default connectDB;