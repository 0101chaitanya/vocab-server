const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server');
const jwt = require('jsonwebtoken');
const utils = require('../utils');
const axios = require('axios');
const resolvers = {
  Query: {
    currentUser: (parent, args, context) => {
      const { currentUser } = context;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      return currentUser;
    },
    allWords: async (parent, { username, password }, context) => {
      const { currentUser, dataSources } = context;
      const { User } = dataSources;
      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      return currentUser.words;
    },
  },
  Mutation: {
    register: async (parent, { username, password }, context) => {
      const { currentUser, dataSources } = context;

      const { User } = dataSources;
      const { salt, hash } = await utils.genPassword(password);

      try {
        const newUser = new User({
          username,
          hash,
          salt,
        });
        const user = await newUser.save();
        return user;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: username,
        });
      }
    },
    login: async (parent, { username, password }, context) => {
      const { currentUser, dataSources } = context;

      const { User } = dataSources;

      const user = await User.findOne({ username });
      if (!user) {
        throw new UserInputError('wrong credentials');
      }
      const isValid = utils.validPassword(password, user.hash);
      if (isValid) {
        const { token, expires } = utils.issueJWT(user);

        return { success: true, user, token, expiresIn: expires };
      } else {
        throw new UserInputError('wrong credentials');
      }
    },
    addWord: async (parent, { word }, context) => {
      const { currentUser, dataSources } = context;

      const { User } = dataSources;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      try {
        const response = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const wordInfo = response.data;

        wordInfo.forEach((item) => {
          currentUser.words.push(item);
        });

        const saved = await currentUser.save();

        return wordInfo;
      } catch (err) {
        throw new ApolloError("Word doesn't exist", '404');
      }
    },
  },
};

module.exports = resolvers;
