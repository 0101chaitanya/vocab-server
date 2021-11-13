const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
  },
  hash: String,
  salt: String,
  words: [
    {
      word: String,
      phonetic: String,
      phonetics: [
        {
          text: String,
          audio: String,
        },
      ],
      origin: String,
      meanings: [
        {
          partOfSpeech: String,
          definitions: [
            {
              definition: String,
              example: String,
              synonyms: [String],
              antonyms: [String],
            },
          ],
        },
      ],
    },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('user', userSchema);
