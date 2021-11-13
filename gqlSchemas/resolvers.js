const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');

const resolvers = {
  Query: {
   currentUser: (parent, args, context) => {
      const {  currentUser } = context;
     
      return currentUser;
     
  }
},
Mutation :(parent, {username, password}, context) => {
       const { salt, hash } = await utils.genPassword(password);

    const newUser = new User({
        username,
        hash,
        salt,
        
    });
     const user = await newUser.save();

    const { token, expires } = utils.issueJWT(user);

  }
}