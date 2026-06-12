const mongoose = require('mongoose');

// Cache the MongoDB connection across serverless function invocations
// This prevents opening a new connection on every request (critical for serverless)
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    cached.promise = mongoose.connect(MONGO_URI, {
      family: 4, // Force IPv4
    }).then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
