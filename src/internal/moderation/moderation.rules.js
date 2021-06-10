const { query } = require("express-validator");
const mongoose = require("mongoose");

const getItems = [
  query("itemType").isInt({ min: 0, max: 1 }).toInt(),
  query("cursor")
    .isMongoId()
    .optional()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

module.exports = {
  getItems: getItems,
};
