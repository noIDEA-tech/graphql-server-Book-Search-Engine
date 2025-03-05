import { fileURLToPath } from 'url';  //for ES modules
import { dirname } from 'path';    

const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);   

import express from 'express';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';
import db from './config/connection.js';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const app = express();
 
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Add a timeout to detect if the DB connection is hanging
setTimeout(() => {
  console.log('WARNING: MongoDB connection has not completed after 5 seconds');
}, 5000);

const startApolloServer = async () => {
  try {
    await server.start();
    console.log('Apollo Server started successfully');

    // Setup Express middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Setup GraphQL endpoint
    app.use('/graphql', cors(), expressMiddleware(server, {
      context: authMiddleware
    }));

    // Production static assets
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      });
    }

    console.log('Attempting to connect to MongoDB...');

    // Start the server regardless of DB connection
    const httpServer = app.listen(PORT, () => {
      console.log(`🌍 Server now running on localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
    });

    // Setup MongoDB connection
    db.once('open', () => {
      console.log('✅ Connected to MongoDB successfully');
    });

    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};
// Start the server
startApolloServer();