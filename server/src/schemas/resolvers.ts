import { GraphQLError } from 'graphql';
import User from '../models/User.js';
import {signToken } from '../services/auth.js';
import { Context } from '../types/context.js';


const resolvers = {
    Query: {
      // Get the logged-in user
      me: async (_parent: unknown, _args: unknown, context: Context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
        },
      });
    },
  },
  
  Mutation: {
    // Create a user, sign a token, and send it back
    addUser: async (_parent: unknown, args: { username: string; email: string; password: string }) => {
      const user = await User.create(args);
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Login a user, sign a token, and send it back
    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError('No user found with this email address', {
          extensions: {
            code: 'USER_NOT_FOUND',
          },
        });
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new GraphQLError('Incorrect credentials', {
          extensions: {
            code: 'INCORRECT_CREDENTIALS',
          },
        });
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },


 // Save a book to a user's `savedBooks` field
 saveBook: async (_parent: unknown, { bookData }: { bookData: any }, context: Context) => {
    if (context.user) {
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
    }
    throw new GraphQLError('You need to be logged in!', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  },

  // Remove a book from `savedBooks`
  removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context) => {
    if (context.user) {
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    }
    throw new GraphQLError('You need to be logged in!', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
   },
  },
};

export default resolvers;