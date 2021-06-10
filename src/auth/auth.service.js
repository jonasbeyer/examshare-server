const Session = require("./session.model");
const response = require("../shared/utils/response");
const utilities = require("../shared/utils/utilities");

const mailService = require("../shared/mail/mail.service");
const firebaseService = require("../shared/firebase/firebase.service");
const tokenService = require("../shared/token/token.service");

function signUp(signUpDto) {
  return userService
    .isUsernameAvailable(signUpDto.username)
    .then(() => userService.isEmailAvailable(signUpDto.email))
    .then(() => userService.createUser(signUpDto))
    .then((user) => mailService.send(mailService.REGISTRATION, user));
}

async function signIn(dto) {
  const user = await userService.findUser(dto.identifier);
  if (!user || !user.verifyPassword(dto.password)) {
    throw response.WRONG_CREDENTIALS;
  }

  return createSessionToken(dto, user);
}

async function signOut(bearerToken) {
  const session = await Session.findByIdAndDelete(bearerToken);
  await firebaseService.deleteDeviceToken(session ? session.fcmToken : null);
}

async function requestPasswordReset(email) {
  const user = await userService.findUserByMail(email, {
    username: 1,
    email: 1,
  });

  if (user != null) {
    mailService.send(mailService.RESET_PASS, user);
  }
}

async function requestVerificationEmail(verificationDto) {
  const user = await userService.findUser(verificationDto.identifier);
  if (!user || !user.verifyPassword(verificationDto.password)) {
    throw response.WRONG_CREDENTIALS;
  }

  if (user.status !== 0) {
    throw response.USER_ALREADY_VERIFIED;
  }

  return (!verificationDto.email
    ? Promise.resolve()
    : userService.isEmailAvailable(verificationDto.email)
  ).then(() =>
    mailService.send(mailService.REGISTRATION, user, verificationDto.email),
  );
}

async function changePasswordWithToken(changePasswordDto) {
  const token = await tokenService.validateToken(changePasswordDto.tokenId);
  if (!token) {
    throw response.LINK_INVALID;
  }

  return userService
    .updatePassword(token.userId, changePasswordDto.password)
    .then(() => tokenService.removeToken(token));
}

async function createSessionToken(signInDto, user) {
  let updateUser;
  switch (user.status) {
    case 0:
      const result = new response.Response().merge(response.PENDING_EMAIL);
      result.data = { email: user.email };
      result.replace("%email", user.email);

      throw result;
    case 2:
      throw response.ACCOUNT_BLOCKED;
    case 3:
      user.status = 1;
      user.deactivatedAt = undefined;
      updateUser = user.save();
  }

  const session = new Session({
    _id: utilities.generateId(),
    userId: user._id,
    lastIP: signInDto["x-real-ip"],
    userAgent: signInDto["user-agent"],
    fcmToken: signInDto.fcmToken,
  });

  await Promise.all([session.save(), updateUser]);

  return {
    token: session._id,
    user: user.toJSON(),
  };
}

async function getSession(sessionId, projection) {
  const session = await Session.findById(sessionId, projection);
  if (!session) {
    throw response.SESSION_INVALID;
  }

  return session;
}

async function findFcmTokens(userId) {
  const sessions = await Session.find(
    { userId: userId, fcmToken: { $exists: true } },
    { device: 1 },
  ).limit(1000);

  return sessions.map((session) => session.fcmToken);
}

function updateSession(headers, session) {
  session.lastIP = headers["x-real-ip"];
  session.userAgent = headers["user-agent"];

  return session.save();
}

async function deleteSessions(userId) {
  const sessions = await Session.find({ userId: userId }, { fcmToken: 1 });
  return Promise.all(
    sessions.map((session) =>
      Promise.all([
        session.remove(),
        firebaseService.deleteFcmToken(session.fcmToken),
      ]),
    ),
  );
}

module.exports = {
  signUp: signUp,
  signIn: signIn,
  signOut: signOut,
  requestPasswordReset: requestPasswordReset,
  requestVerificationEmail: requestVerificationEmail,
  changePasswordWithToken: changePasswordWithToken,
  getSession: getSession,
  findFcmTokens: findFcmTokens,
  updateSession: updateSession,
  deleteSessions: deleteSessions,
};

// Fix circular dependency
const userService = require("../user/user.service");
