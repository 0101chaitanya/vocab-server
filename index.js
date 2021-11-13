const { ApolloServer, UserInputError, gql } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const typeDefs = require('./gqlSchemas/typeDefs');
require('dotenv').config();

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
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findBy(decodedToken.id);
      return { currentUser };
    }
  },

  dataSources: () => ({}),
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
