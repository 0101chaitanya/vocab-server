const { ApolloServer, UserInputError, gql } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const typeDefs = require('./gqlSchema/typeDefs');
const resolvers = require('./gqlSchema/resolvers');
const { Strategy, ExtractJwt } = require('passport-jwt');

const base64pub = process.env.PUBLIC_KEY;
const PUBLIC_KEY = Buffer.from(base64pub, 'base64');

const User = require('./dbSchemas/userSchema');
const Word = require('./dbSchemas/wordSchema');

require('dotenv').config({ path: './.env' });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {})
  .catch((err) => console.log('error connecting to MongoDB', err, message));
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      try {
        const verifyOptions = {
          expiresIn: '1d',
          algorithm: ['RS256'],
        };
        const decodedToken = jwt.verify(
          auth.substring(7),
          PUBLIC_KEY,
          verifyOptions
        );
        const currentUser = await User.findById(decodedToken.id).populate(
          'words'
        );
        return { currentUser };
      } catch (err) {
        console.log(err);
        return { currentUser: null };
      }
    }
    return { currentUser: null };
  },

  dataSources: () => ({
    User,
    Word,
  }),
});

server
  .listen({
    port: process.env.PORT || 4001,
  })
  .then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
