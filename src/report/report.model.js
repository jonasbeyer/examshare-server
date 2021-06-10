const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    author: Schema.Types.ObjectId,
    itemId: Schema.Types.ObjectId,
    itemType: String,
    reason: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
