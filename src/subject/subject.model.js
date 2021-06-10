const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema(
  {
    name: String,
    category: String,
  },
  {
    versionKey: false,
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

module.exports = mongoose.model("Subject", subjectSchema);
