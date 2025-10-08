const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credit_registration', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    // If MongoDB connection fails, suggest alternatives
    console.log('\n🔧 MongoDB Connection Failed!');
    console.log('📋 Setup Options:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo');
    console.log('\n⚠️  Server will continue running but database operations will fail.');

    return false;
  }
};

module.exports = connectDB;


