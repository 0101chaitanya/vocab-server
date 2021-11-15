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
    allWords: async (parent, _, context) => {
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
        return true;
      } catch (error) {
        return false;
      }
    },
    login: async (parent, { username, password }, context) => {
      const { currentUser, dataSources } = context;

      const { User } = dataSources;

      const user = await User.findOne({ username }).select('hash');
      if (!user) {
        throw new UserInputError('wrong credentials');
      }
      const isValid = utils.validPassword(password, user.hash);
      if (isValid) {
        const { token, expires } = utils.issueJWT(user);

        return { token };
      } else {
        return { token: null };
      }
    },
    addWord: async (parent, { word }, context) => {
      const { currentUser, dataSources } = context;

      const { User, Word } = dataSources;
      console.log('lol');
      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }
      console.log(word);

      try {
        const response = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const wordInfo = response.data;
        const item = wordInfo[0];

        const existInDB = await Word.findOne({ word: item.word });
        let saved;
        console.log('exist', existInDB.toObject());
        if (!existInDB) {
          let saved = await new Word(item).save();
          console.log('saved', saved.toObject());
        }

        const targetUser = await User.findById(currentUser.id);

        console.log('targetUser', targetUser.toObject());
        if (!targetUser.toObject().words.includes(saved.toObject().id)) {
          const savedUser = await User.findOneAndUpdate(
            { _id: currentUser.id },
            { $push: { words: saved.toObject().id } }
          );
          console.log('su', savedUser);
        }
        console.log(existInDB.toObject(), saved.toObject());
        return existInDB ? existInDB.toObject().word : saved.toObject().word;
      } catch (err) {
        throw new UserInputError();
      }
    },
  },
};

module.exports = resolvers;
