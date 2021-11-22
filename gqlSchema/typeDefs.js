const { gql } = require('apollo-server');
const MONGOID = require('apollo-server-mongo-id-scalar');

const typeDefs = gql`
  scalar MONGOID

  type Definition {
    definition: String
    example: String
    synonyms: [String]
    antonyms: [String]
  }

  type Meaning {
    partOfSpeech: String
    definitions: [Definition]
  }

  type Phonetics {
    text: String
    audio: String
  }

  type Word {
    id: ID!
    word: String
    phonetic: String
    phonetics: [Phonetics]
    origin: String
    meanings: [Meaning]
  }

  type User {
    id: ID!
    words: [MONGOID]
  }

  type Query {
    currentUser(id: ID, username: String): User
    allWords: [Word]
    matchingWords(searchQuery: String!): [Word]
  }

  type Token {
    token: String
  }

  type Mutation {
    register(username: String!, password: String!): Boolean!
    login(username: String!, password: String!): Token
    addWord(word: String!): String!
  }
`;

module.exports = typeDefs;
