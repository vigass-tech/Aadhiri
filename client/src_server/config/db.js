const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for serverless environments like Vercel)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadhirai';

  // Check if unreplaced placeholders are present
  if (
    uri.includes('<db_username>') ||
    uri.includes('<db_password>') ||
    uri.includes('<MY_USERNAME>') ||
    uri.includes('<MY_PASSWORD>')
  ) {
    console.error('[MongoDB Error] Database URI contains unreplaced placeholders (<username> / <password>).');
    console.error('Please configure your valid Atlas database credentials in environment variables.');
    return null;
  }

  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Target Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
