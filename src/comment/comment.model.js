const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Report = require("../report/report.model");

const commentSchema = new Schema(
  {
    author: Schema.Types.ObjectId,
    taskId: Schema.Types.ObjectId,
    threadId: Schema.Types.ObjectId,
    message: String,
    likedBy: [Schema.Types.ObjectId],
    dislikedBy: [Schema.Types.ObjectId],
    pinned: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.likedBy;
        delete ret.dislikedBy;
      },
    },
  },
);

commentSchema.pre("deleteMany", function (next) {
  Report.deleteMany({
    $or: [{ _id: this._id }, { threadId: this._id }],
  }).exec();
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
