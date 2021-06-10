const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Double = require("@mongoosejs/double");

const Report = require("../report/report.model");
const Comment = require("../comment/comment.model");

const taskSchema = new Schema(
  {
    title: String,
    author: Schema.Types.ObjectId,
    subject: Schema.Types.ObjectId,
    keywords: [String],
    taskImages: [String],
    solutionImages: [String],
    ratedBy: [Schema.Types.ObjectId],
    rating: {
      type: Double,
      default: 0.0,
    },
    grade: Number,
    creator: String,
    schoolForm: String,
    federalState: String,
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.ratedBy;
      },
    },
  },
);

taskSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  Report.deleteMany({ itemId: this._id }).exec();
  Comment.deleteMany({ taskId: this._id }).exec();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
