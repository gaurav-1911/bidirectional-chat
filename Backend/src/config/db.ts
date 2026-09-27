import dns from 'dns';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Only set custom DNS on Windows if needed, avoid interfering on Linux containers
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore DNS error
  }
}

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bidirectional-chat-bot';

  const connectWithOptions = async () => {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000, // Fail fast in 5s instead of hanging 30s
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        autoIndex: true,
      });
      logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
      logger.error(`💥 MongoDB Connection Error: ${error.message}`);
      // Retry connection in 5 seconds
      setTimeout(connectWithOptions, 5000);
    }
  };

  // Mongoose connection event listeners
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected! Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('🍃 MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`💥 MongoDB runtime error: ${err.message}`);
  });

  await connectWithOptions();
};
