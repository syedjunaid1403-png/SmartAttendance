const mongoose = require('mongoose');

global.useMockDb = false;

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('⚠️ USE_MOCK_DB is set to true. Running in Mock Database Mode.');
    global.useMockDb = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_attendance', {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Failed: ${error.message}`);
    console.warn('🔄 Falling back to Mock In-Memory/JSON Database Mode.');
    global.useMockDb = true;
  }
};

module.exports = connectDB;
