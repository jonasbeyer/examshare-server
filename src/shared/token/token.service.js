const Token     = require("./token.model"),
      utilities = require("../utils/utilities");

const duration  = 20 * 60 * 1000;

function generateToken(type, userId, newEmail) {
  const token = new Token({
    _id: utilities.generateId(),
    type: type,
    userID: userId,
    newEmail: newEmail,
  });

  return token.save();
}

async function validateToken(tokenId) {
  const token = await Token.findById(tokenId);
  return token && token.createdAt.toNumber() + duration > Date.now();
}

function removeToken(token) {
  return token ? Token.deleteOne({ _id: token._id }) : Promise.resolve();
}

function removeTokenByUserId(userId) {
  return Token.deleteMany({ userId });
}

module.exports = {
  generateToken: generateToken,
  validateToken: validateToken,
  removeToken: removeToken,
  removeTokenByUserId: removeTokenByUserId,
};
