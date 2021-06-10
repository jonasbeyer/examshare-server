const mongoose = require("mongoose");
const cryptUtil = require("../shared/utils/crypt.util");

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    firstIP: String,
    profileImage: String,
    role: {
      type: Number,
      ref: "Role",
      default: 0,
    },
    status: {
      type: Number,
      default: 0,
    },
    deactivatedAt: Date,
    properties: {
      type: Map,
      of: String,
      default: {},
    },
    favorites: [Schema.Types.ObjectId],
    notifications: [Schema.Types.ObjectId],
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  },
);

userSchema.methods.verifyPassword = function (password) {
  return cryptUtil.comparePassword(this.password, password);
};

userSchema.methods.canAdministrate = function () {
  return this.role === 2;
};

userSchema.methods.canModerate = function () {
  return this.role > 0;
};

userSchema.methods.isNotificationEnabled = function (subject) {
  return this.notifications.indexOf(subject) !== -1;
};

module.exports = mongoose.model("User", userSchema);
