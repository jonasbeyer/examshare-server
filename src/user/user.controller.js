const express = require("express");
const authentication = require("../shared/middleware/auth.middleware");
const response = require("../shared/utils/response");
const imageUtil = require("../shared/utils/image.util");
const validate = require("../shared/middleware/validation.middleware");
const rules = require("./user.rules");

const userService = require("./user.service");
const taskService = require("../task/task.service");

const router = express.Router();

router.get("/info", authentication(), validate(rules.get), (req, res) => {
  const query = userService.getUserQuery(req.query, req.userId);
  userService
    .findUserByQuery(query)
    .then((user) => res.json(user))
    .catch((error) => res.json(error));
});

router.put(
  "/password",
  authentication(),
  validate(rules.updatePassword),
  (req, res) => {
    userService
      .updatePasswordWithOldPassword(
        req.userId,
        req.body.oldPassword,
        req.body.password,
      )
      .then(() => res.json(response.UPDATED_PASSWORD))
      .catch((error) => res.json(error));
  },
);

router.put(
  "/email",
  authentication(),
  validate(rules.updateEmail),
  (req, res) => {
    userService
      .updateEmail(req.userId, req.body.email)
      .then(() => res.json(response.UPDATED_EMAIL))
      .catch((error) => res.json(error));
  },
);

router.get("/:userId/profileImage", authentication(), (req, res) => {
  userService
    .getProfileImageBuffer(req.params.userId)
    .then((buffer) => res.type("image/webp").send(buffer))
    .catch((error) => res.json(error));
});

const upload = imageUtil.getUploadMiddleware("profiles");
router.put(
  "/me/profileImage",
  authentication(),
  upload.single("profileImage"),
  (req, res) => {
    if (!req.file) return res.json(response.BAD_REQUEST);

    userService
      .updateProfileImage(req.userId, req.file.path, req.file.filename)
      .then(() => res.json(response.SUCCESS))
      .catch(() => res.json(response.NOT_FOUND));
  },
);

router.put(
  "/properties",
  authentication(),
  validate(rules.updateProperties),
  (req, res) => {
    userService
      .updateProperties(req.userId, req.body)
      .then(() => res.json(response.SUCCESS));
  },
);

router.get("/tasks", authentication(), validate(rules.getTasks), (req, res) => {
  userService
    .findUserById(req.userId, { favorites: 1 })
    .then((user) => taskService.getFilteredUserTask(req.query, user))
    .then((data) => res.json(data))
    .catch((error) => res.json(error));
});

router.post(
  "/disable",
  authentication(),
  validate(rules.disable),
  (req, res) => {
    userService
      .disableUser(req.userId, req.body.password)
      .then(() => res.json(response.DISABLED_ACCOUNT))
      .catch((error) => res.json(error));
  },
);

module.exports = router;
