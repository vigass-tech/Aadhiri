const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadhirai';

  // Check if unreplaced placeholders are present
  if (uri.includes('<db_username>') || uri.includes('<db_password>') || uri.includes('<MY_USERNAME>') || uri.includes('<MY_PASSWORD>')) {
    console.error('[MongoDB Error] Database URI contains unreplaced placeholders (<username> / <password>).');
    console.error('Please configure your valid Atlas database credentials in server/.env.');
    return;
  }

  // Mask credentials for terminal and log safety
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Target Database: ${conn.connection.name}`);
    console.log(`[MongoDB] Connection String: ${safeUri}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

