const { body } = require("express-validator");

const pushNotification = [
  body("title").isString().trim().isLength({ min: 1, max: 30 }),
  body("message").isString().trim().isLength({ min: 1, max: 200 }),
  body("userId").isMongoId().optional(),
];

module.exports = {
  pushNotification: pushNotification,
};
