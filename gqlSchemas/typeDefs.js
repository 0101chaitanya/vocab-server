const { gql } = require('apollo-server');
const typeDefs = gql`
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
      word: String
      phonetic: String
      phonetics: [Phonetics]
      origin: String
      meanings: [Meaning]
    }
  
type User {
  id:ID!
  words:[Word]
}

type Query{
  currentUser(id: ID, username: String): User 
}

type Mutation {
  register(username: String!, password: String!): User
     login(username: String!, password: String!): Token
    addWord(word: String!): Word
  
}

`;

module.exports =typeDefs;