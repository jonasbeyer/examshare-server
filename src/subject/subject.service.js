const Subject = require("./subject.model");

const authService = require("../auth/auth.service");
const userService = require("../user/user.service");
const firebaseService = require("../shared/firebase/firebase.service");

async function findUserSubjects(userId) {
  const user = await userService.findUserById(userId, { notifications: 1 });

  const result = await Subject.find();
  return result.map((subject) => {
    subject = subject.toObject();
    subject.notificationsEnabled = user.isNotificationEnabled(subject.id);
    return subject;
  });
}

async function updateUserNotificationPreference(subjectId, isEnabled, userId) {
  const subject = subjectId.toString();
  const query = isEnabled
    ? { $addToSet: { notifications: subjectId } }
    : { $pull: { notifications: subjectId } };

  return userService
    .updateUser(userId, query)
    .then(() => authService.findFcmTokens(userId))
    .then((tokens) =>
      firebaseService.changeSubscription(tokens, subject, isEnabled),
    );
}

async function getSubjectNameById(subjectId) {
  const subject = await Subject.findById(subjectId);
  return subject.name;
}

module.exports = {
  findUserSubjects: findUserSubjects,
  updateUserNotificationPreference: updateUserNotificationPreference,
  getSubjectNameById: getSubjectNameById,
};
