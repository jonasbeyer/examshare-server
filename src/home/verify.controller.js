const express = require("express"),
  tokenService = require("../shared/token/token.service"),
  userService = require("../user/user.service"),
  response = require("../shared/utils/response"),
  utilities = require("../shared/utils/utilities"),
  router = express.Router();

router.get("/email/:tokenId", async (req, res) => {
  if (isNaN(req.query.userId)) {
    sendWebAppResponse(
      res,
      req.query.app,
      new response.Response(
        400,
        undefined,
        "Es ist ein Verarbeitungsfehler aufgetreten. Bitte überprüfe den benutzten Link und versuche es erneut.",
      ),
    );
    return;
  }

  const token = await tokenService.validateToken(req.params.tokenId);
  if (!token || token.userId !== req.query.userId) {
    tokenService
      .removeToken(token)
      .then(() =>
        sendWebAppResponse(res, req.query.app, response.LINK_INVALID),
      );
    return;
  }

  const user = await userService.findUserById(token.userId, {
    status: 1,
    email: 1,
  });
  switch (token.type) {
    case "registration":
      handleUserRegistration(req, res, user, token);
      break;
    case "verification":
      handleMailVerification(req, res, user, token);
      break;
    case "reset":
      handlePasswordReset(req, res);
  }
});

function handleUserRegistration(req, res, user, token) {
  if (user.status !== 0) {
    tokenService
      .removeToken(token)
      .then(() =>
        sendWebAppResponse(res, req.query.app, response.USER_ALREADY_VERIFIED),
      );
    return;
  }

  user.status = 1;
  user.email = token.newEmail || user.email;
  (token.newEmail
    ? userService.isEmailAvailable(user.Email)
    : Promise.resolve()
  )
    .then(() => user.save())
    .then(() => sendWebAppResponse(res, req.query.app, response.VERIFIED_USER))
    .catch(() =>
      sendWebAppResponse(res, req.query.app, response.EMAIL_NOT_AVAILABLE),
    )
    .then(() => tokenService.removeToken(token));
}

function handleMailVerification(req, res, user, token) {
  user.email = token.newEmail;
  userService
    .isEmailAvailable(user.email)
    .then(() => user.save())
    .then(() => sendWebAppResponse(res, req.query.app, response.VERIFIED_EMAIL))
    .catch(() =>
      sendWebAppResponse(res, req.query.app, response.EMAIL_NOT_AVAILABLE),
    )
    .then(() => tokenService.removeToken(token));
}

function handlePasswordReset(req, res) {
  sendWebAppResponse(res, req.query.app, response.SUCCESS);
}

function sendWebAppResponse(res, app, response) {
  switch (app === "true") {
    case true:
      res.json(response);
      break;
    case false:
      const message = response.exportMessage();
      res.render(message ? "verified" : "resetPassword", { message: message });
      break;
  }
}

module.exports = router;
