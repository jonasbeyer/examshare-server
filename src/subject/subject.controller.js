const express = require("express");
const router = express.Router();
const authentication = require("../shared/middleware/auth.middleware");
const validation = require("../shared/middleware/validation.middleware");
const rules = require("./subject.rules");
const response = require("../shared/utils/response");

const subjectService = require("./subject.service");

router.get("/", authentication(), async (req, res) => {
  const subjects = await subjectService.findUserSubjects(req.userId);
  res.json(subjects);
});

router.put(
  "/:subjectId/notifications_enabled",
  authentication(),
  validation(rules.updateSubjectNotificationPreference),
  (req, res) => {
    subjectService
      .updateUserNotificationPreference(
        req.params.subjectId,
        req.body.isEnabled,
        req.userId,
      )
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

module.exports = router;
