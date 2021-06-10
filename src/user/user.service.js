const User = require("./user.model");
const mailService = require("../shared/mail/mail.service");

const imageUtil = require("../shared/utils/image.util");
const cryptUtil = require("../shared/utils/crypt.util");
const response = require("../shared/utils/response");
const utilities = require("../shared/utils/utilities");

function findUser(identifier, projection) {
  return User.findOne(
    { $or: [{ username: identifier }, { email: identifier }] },
    projection,
  ).collation({
    locale: "de",
    strength: 2,
  });
}

function findUserById(userId, projection) {
  return User.findById(userId, projection);
}

function getUserQuery(query, userId) {
  const myProfile = !query.username && !query.userId;
  return {
    myProfile: myProfile,
    username: query.username,
    userId: myProfile ? userId : query.userId || -1,
    projection:
      "username role status properties registeredAt" +
      (myProfile ? " email notifications" : ""),
  };
}

async function getProfileImageBuffer(userId) {
  const user = await findUserById(userId, { profileImage: 1 });
  if (!user || !user.profileImage) {
    throw response.NOT_FOUND;
  }

  return imageUtil.getImageBuffer(user.profileImage);
}

function updateProfileImage(userId, filePath, fileName) {
  let oldImageId;
  return imageUtil
    .storeImage(filePath)
    .then(() => findUserById(userId, { profileImage: 1 }))
    .then((user) => {
      oldImageId = user.profileImage;

      user.profileImage = fileName;
      return user.save();
    })
    .then(() => imageUtil.deleteProfileImage(oldImageId));
}

async function findUserByQuery(query) {
  const search = query.username
    ? { username: query.username }
    : { _id: query.userId };

  const user = await User.findOne(search, query.projection)
    .populate("role")
    .lean();

  if (!isAccountAccessible(user, query.myProfile)) {
    throw response.NOT_FOUND;
  }

  user.tasks = await taskService.getTasksCount(user._id);
  user.rating = await taskService.getRatingAverage(user._id);
  return user;
}

function isAccountAccessible(user, myProfile) {
  return (
    user &&
    (myProfile ||
      (user.status !== 2 && utilities.isPropertyEnabled(user, "public")))
  );
}

function updateProperties(userId, body) {
  return updateUser(userId, { properties: body });
}

function getUsernameById(userId) {
  return findUserById(userId, { username: 1 }).then((user) => user.username);
}

function findUsers(query = {}, projection) {
  return User.find(query, projection);
}

function findUserByMail(email, projection) {
  return User.findOne({ email: email.trim() }, projection).collation({
    locale: "de",
    strength: 2,
  });
}

function updateUser(userId, updateData) {
  return User.updateOne({ _id: userId }, updateData);
}

async function updatePassword(userId, password) {
  return updateUser(userId, {
    password: await cryptUtil.encryptPassword(password),
  });
}

async function updatePasswordWithOldPassword(userId, oldPassword, password) {
  const user = await findUserById(userId, { password: 1 });

  if (!user.verifyPassword(oldPassword)) {
    throw response.WRONG_OLD_PASSWORD;
  }

  user.password = await cryptUtil.encryptPassword(password);
  await user.save();
}

async function updateEmail(userId, emailAddress) {
  return isEmailAvailable(emailAddress)
    .then(() => userService.findUserById(userId, { username: 1 }))
    .then((user) =>
      mailService.send(mailService.VERIFICATION, user, emailAddress),
    );
}

async function disableUser(userId, confirmationPassword) {
  const user = await findUserById(userId, {
    username: 1,
    email: 1,
    password: 1,
  });

  if (!user.verifyPassword(confirmationPassword)) {
    throw response.WRONG_PASSWORD;
  }

  user.status = 3;
  user.deactivatedAt = Date.now();

  await Promise.all([
    user.save(),
    authService.deleteSessions(user._id),
  ]).then(() => mailService.send(mailService.DEACTIVATION, user));
}

async function getUsersFavorites(userId) {
  const user = await findUserById(userId, { favorites: 1 });
  return user ? user.favorites : [];
}

async function isUsernameAvailable(username) {
  const count = await User.countDocuments({ username }).collation({
    locale: "de",
    strength: 2,
  });

  if (count !== 0) {
    throw response.USERNAME_NOT_AVAILABLE;
  }
}

async function isEmailAvailable(email) {
  const count = await User.countDocuments({ email }).collation({
    locale: "de",
    strength: 2,
  });

  if (count !== 0) {
    throw response.EMAIL_NOT_AVAILABLE;
  }
}

async function createUser(createUserDto) {
  const password = await cryptUtil.encryptPassword(createUserDto.password);
  const user = new User({
    username: createUserDto.username,
    password: password,
    email: createUserDto.email,
    firstIP: createUserDto["x-real-ip"],
  });

  return user.save();
}

async function isModerationAllowed(userId) {
  const user = await findUserById(userId, { role: 1 });
  return user.canModerate();
}

async function isAdministrationAllowed(userId) {
  const user = await findUserById(userId, { role: 1 });
  return user.canAdministrate();
}

module.exports = {
  findUser: findUser,
  findUsers: findUsers,
  findUserById: findUserById,
  findUserByMail: findUserByMail,
  findUserByQuery: findUserByQuery,
  getUsernameById: getUsernameById,
  getUserQuery: getUserQuery,
  getUsersFavorites: getUsersFavorites,
  createUser: createUser,
  updateUser: updateUser,
  updatePassword: updatePassword,
  updatePasswordWithOldPassword: updatePasswordWithOldPassword,
  updateEmail: updateEmail,
  disableUser: disableUser,
  updateProperties: updateProperties,
  isUsernameAvailable: isUsernameAvailable,
  isEmailAvailable: isEmailAvailable,
  getProfileImageBuffer: getProfileImageBuffer,
  updateProfileImage: updateProfileImage,
  isModerationAllowed: isModerationAllowed,
  isAdministrationAllowed: isAdministrationAllowed,
};

// Fix circular dependency
const taskService = require("../task/task.service");
const authService = require("../auth/auth.service");
