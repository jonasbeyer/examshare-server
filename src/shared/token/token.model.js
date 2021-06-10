const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    _id: String,
    type: String,
    userId: Schema.Types.ObjectId,
    newEmail: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Token", tokenSchema);
