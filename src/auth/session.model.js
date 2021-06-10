const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    _id: String,
    userId: Schema.Types.ObjectId,
    lastIP: String,
    userAgent: String,
    fcmToken: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Session", sessionSchema);
