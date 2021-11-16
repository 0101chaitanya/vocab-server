const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    unique: true,
    required: true,
  },
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
});

wordSchema.set('toObject', { getters: true, virtuals: true });
wordSchema.set('toJSON', { getters: true, virtuals: true });

wordSchema.plugin(uniqueValidator);

module.exports = mongoose.model('word', wordSchema);
