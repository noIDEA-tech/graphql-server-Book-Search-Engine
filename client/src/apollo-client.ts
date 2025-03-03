// client/src/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Auth from './utils/auth';

// Create an http link
const httpLink = createHttpLink({
  uri: '/graphql', // Make sure this matches your proxy setup
});

// Create an auth link
const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create the Apollo Client instance
const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache()
});

export default client;