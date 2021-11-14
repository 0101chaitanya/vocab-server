const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
  },
  hash: {
    type: String,
    select: false,
  },
  salt: {
    type: String,
    select: false,
  },
  words: [
    {
      type: Schema.Types.ObjectId,
      ref: 'word',
    },
  ],
});
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('user', userSchema);
