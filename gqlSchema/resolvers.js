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
      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const wordInfo = response.data;
      const item = wordInfo[0];
      console.log('0');

      try {
        const existInDB = await Word.findOne({ word: item.word });
        let saved;
        if (!existInDB) {
          saved = await new Word(item).save();
        }
        console.log('1');
        const targetUser = JSON.parse(
          JSON.stringify(await User.findById(currentUser.id))
        );
        //console.log(targetUser);
        const includeIn = targetUser.words.includes(
          JSON.parse(JSON.stringify(existInDB ?? saved)).id
        ); //._doc; //toObject({ getters: true }); //JSON.stringify

        //.words.includes(saved.toObject().id);
        console.log(includeIn);
        if (!includeIn) {
          const savedUser = await User.findOneAndUpdate(
            { _id: currentUser.id },
            { $push: { words: saved.toObject().id } }
          );

          console.log('2');
          //return true;
          return 'Word saved to database successfully';
        }
        // return existInDB && includeIn ? false : true;
        return 'Word already exist in list';
        console.log('3');
      } catch (err) {
        return 'Something went wrong';
      }
    },
  },
};

module.exports = resolvers;
