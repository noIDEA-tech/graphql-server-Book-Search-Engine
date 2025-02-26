import express from 'express';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';
import db from './config/connection.js';
import cors from 'cors';
// import routes from './routes/index.js';

const PORT = process.env.PORT || 3001;
const app = express();


// Create a new Apollo server with schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the Apollo server
const startApolloServer = async () => {
  await server.start();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/graphql', cors(), expressMiddleware(server, {
  context: authMiddleware
}));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`🚀 GraphQL at http://localhost:${PORT}/graphql`);
  });
});
};

//call async function to start server
startApolloServer();
