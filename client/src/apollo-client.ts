import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Auth from './utils/auth';

//create http link
const httpLink = createHttpLink({
    uri: '/graphql',
});

//create auth link
const authLink = setContext((_, { headers }) => {
    
    const token = Auth.getToken();

    //return headers to context so httpLink can read them
    return {
        headers: {
           ...headers,
           authorization: token ? `Bearer ${token}` : '',  
        }
      };
    });

 //create Apollo Client instance
const client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache()
});

export default client;
