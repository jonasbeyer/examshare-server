const express = require("express");
const authentication = require("../../shared/middleware/auth.middleware");
const validation = require("../../shared/middleware/validation.middleware");
const rules = require("./moderation.rules");
const service = require("./moderation.service");

const router = express.Router();

router.get(
  "/items",
  authentication(),
  validation(rules.getItems),
  (req, res) => {
    service
      .getItems(req.query, req.userId)
      .then((items) => res.json(items))
      .catch((error) => res.json(error));
  },
);

module.exports = router;
