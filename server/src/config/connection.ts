import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks')
  .then(() => console.log('🗃️ Connected to MongoDB successfully'))
  .catch(err => console.error('❌ Failed to connect to MongoDB:', err));

export default mongoose.connection;
