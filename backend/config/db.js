const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = 'mongodb+srv://routine-master:routine-master12345@cluster.otu0h9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection error:', error.message);
  }
};

module.exports = connectDB;