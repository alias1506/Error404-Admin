const mongoose = require('mongoose');
const dns = require('dns');

// Use Google's public DNS to resolve MongoDB Atlas SRV records
// This fixes ECONNREFUSED errors on networks with restricted DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }
    await mongoose.connect(MONGO_URI, {
      family: 4, // Force IPv4
    });
    console.log('Admin backend connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

module.exports = connectDB;
