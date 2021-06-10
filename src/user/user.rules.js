const { query, body, oneOf } = require("express-validator");
const mongoose = require("mongoose");

const get = [
  query("userId")
    .isMongoId()
    .optional()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  query("username").isString().trim().optional(),
];

const getTasks = [
  query("filter").isInt({ min: 1, max: 5 }).toInt(),
  query("search").isString().trim(),
  query("userId").isMongoId().optional(),
  query("cursor").isMongoId().optional(),
];

const updatePassword = [
  body("oldPassword").isString(),
  body("password").isLength({ min: 6 }),
];

const updateEmail = [body("email").isEmail()];

const updateProperties = oneOf([
  body("public").isBoolean().toBoolean(),
  body("notifications").isBoolean().toBoolean(),
  body("grade").isInt({ min: 1, max: 13 }).toInt(),
  body("schoolForm").isString().trim().isLength({ min: 1, max: 20 }),
  body("federalState").isString().trim().isLength({ min: 1, max: 25 }),
]);

const disable = [body("password").isString()];

module.exports = {
  get: get,
  getTasks: getTasks,
  updatePassword: updatePassword,
  updateEmail: updateEmail,
  updateProperties: updateProperties,
  disable: disable,
};
