const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userRoleSchema = new Schema(
  {
    _id: Number,
    name: String,
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model("Role", userRoleSchema);
