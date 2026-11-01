const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAtlasConnection = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Error: MONGO_URI is not defined in server/.env');
    process.exit(1);
  }

  if (uri.includes('<db_username>') || uri.includes('<db_password>')) {
    console.error('Error: Placeholder <db_username> or <db_password> is still present in server/.env.');
    process.exit(1);
  }

  // Safe URI with password masked
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connecting to: ${safeUri}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`\n====================================================`);
    console.log(`  MONGODB ATLAS CONNECTION SUCCESSFUL!`);
    console.log(`  Connected Host: ${conn.connection.host}`);
    console.log(`  Database Name:  ${conn.connection.name}`);
    console.log(`  Ready State:    Connected (code ${conn.connection.readyState})`);
    console.log(`====================================================\n`);

    // Ping test
    const pingResult = await conn.connection.db.admin().ping();
    console.log('Database Ping Result:', pingResult);

    await mongoose.disconnect();
    console.log('Test completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`\n[MongoDB Connection Failed]: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('Tip: Check if database username and password in server/.env are correct.');
    } else if (error.message.includes('whitelist') || error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.error('Tip: Check if IP 0.0.0.0/0 (Allow Access from Anywhere) is active in MongoDB Atlas Network Access.');
    }
    process.exit(1);
  }
};

testAtlasConnection();

