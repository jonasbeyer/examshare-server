const express = require("express");
const authentication = require("../../shared/middleware/auth.middleware");
const validation = require("../../shared/middleware/validation.middleware");
const rules = require("./admin.rules");
const adminMiddleware = require("./admin.middleware");
const router = express.Router();

const firebaseService = require("../../shared/firebase/firebase.service");

router.use(adminMiddleware());
router.post(
  "/sendNotification",
  authentication(),
  validation(rules.pushNotification),
  (req, res) => {
    firebaseService.sendCustomNotification(
      req.body.title,
      req.body.message,
      userId,
    );

    res.json(response.NOTIFICATION_SENT);
  },
);

module.exports = router;
