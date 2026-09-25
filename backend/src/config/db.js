const mongoose = require('mongoose');
const config = require('./env');

let gridFsBucket = null;

async function connectDB() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongoUri, {
    // modern mongoose driver handles these automatically, options kept for clarity
  });

  const db = mongoose.connection.db;
  gridFsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

  console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected from MongoDB');
  });

  return mongoose.connection;
}

function getBucket() {
  if (!gridFsBucket) {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected yet');
    gridFsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  }
  return gridFsBucket;
}

module.exports = { connectDB, getBucket };
