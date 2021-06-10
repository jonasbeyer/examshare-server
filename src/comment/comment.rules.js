const { query, body, param } = require("express-validator");
const mongoose = require("mongoose");

const add = [
  body("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("threadId")
    .isMongoId()
    .optional()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("message").isString().trim().isLength({ min: 1, max: 2000 }),
];

const update = [
  body("message").isString().trim().isLength({ min: 1, max: 2000 }),
];

const deleteComment = [
  param("commentId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

const get = [
  query("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  query("threadId")
    .isMongoId()
    .optional()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

const updateLikeStatus = [
  param("commentId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("likeStatus").isInt({ min: -1, max: 1 }).toInt(),
];

module.exports = {
  add: add,
  get: get,
  update: update,
  deleteComment: deleteComment,
  updateLikeStatus: updateLikeStatus,
};
