const { param, body } = require("express-validator");
const mongoose = require("mongoose");

const updateSubjectNotificationPreference = [
  body("isEnabled").isBoolean().toBoolean(),
  param("subjectId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

module.exports = {
  updateSubjectNotificationPreference: updateSubjectNotificationPreference,
};
