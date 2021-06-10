const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const createReport = [
  body("itemId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("itemType").isString().trim().isIn(["task", "comment"]),
  body("reason").isString().trim().isLength({ min: 1, max: 100 }),
];

const deleteReport = [
  param("reportId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

module.exports = {
  createReport: createReport,
  deleteReport: deleteReport,
};
