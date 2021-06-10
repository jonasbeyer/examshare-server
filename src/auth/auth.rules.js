const { header, body } = require("express-validator");

const signup = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 16 })
    .matches("^[a-zA-Z0-9_]+$")
    .matches(".*?[a-zA-Z].*?.*?[a-zA-Z].*?"),
  body("email").isEmail().trim(),
  body("password").isLength({ min: 6 }),
];

const signin = [
  header("user-agent")
    .isString()
    .trim()
    .isLength({ min: 1, max: 130 })
    .optional(),
  body("identifier").isString().trim(),
  body("password").isString(),
  body("fcmToken").isString().trim().isLength({ min: 1, max: 160 }).optional(),
];

const resetPassword = [body("email").isString().trim()];

const requestVerification = [
  body("identifier").isString().trim(),
  body("password").isString(),
  body("email").isEmail().trim().optional(),
];

const updatePassword = [
  body("tokenId").isString(),
  body("password").isLength({ min: 6 }),
];

module.exports = {
  signup: signup,
  signin: signin,
  resetPassword: resetPassword,
  requestVerification: requestVerification,
  updatePassword: updatePassword,
};
