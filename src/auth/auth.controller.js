const express = require("express");
const router = express.Router();
const authService = require("./auth.service");
const rules = require("./auth.rules");
const response = require("../shared/utils/response");
const validate = require("../shared/middleware/validation.middleware");

router.post("/signup", validate(rules.signup), (req, res) => {
  authService
    .signUp({ ...req.body, ...req.headers })
    .then(() => res.json(response.SUCCESS))
    .catch((response) => res.json(response));
});

router.post("/signin", validate(rules.signin), (req, res) => {
  authService
    .signIn({ ...req.body, ...req.headers })
    .then((sessionData) => res.json(sessionData))
    .catch((response) => res.json(response));
});

router.post("/signout", (req, res) => {
  const bearerToken = req.get("authorization");
  if (!bearerToken) {
    return res.json(response.BAD_REQUEST);
  }

  authService.signOut(bearerToken).then(() => res.json(response.SUCCESS));
});

router.post("/reset_password", validate(rules.resetPassword), (req, res) => {
  authService
    .requestPasswordReset(req.body.email)
    .then(() => res.json(response.EMAIL_SENT_IF_EXISTS));
});

router.post(
  "/request_verification",
  validate(rules.requestVerification),
  (req, res) => {
    authService
      .requestVerificationEmail(req.body)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.put("/password", validate(rules.updatePassword), (req, res) => {
  authService
    .changePasswordWithToken(req.body)
    .then(() => res.json(response.UPDATED_PASSWORD))
    .catch((response) => res.json(response));
});

module.exports = router;
