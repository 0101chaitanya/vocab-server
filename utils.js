const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

/* 
const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');
 */
const base64priv = process.env.PRIVATE_KEY;
const PRIVATE_KEY = Buffer.from(base64priv, 'base64');

const genPassword = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
};
// TODO
const validPassword = async (password, hash, salt) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const id = user._id;

  const expiresIn = '1d';

  const payload = {
    id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIVATE_KEY, {
    expiresIn: expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
