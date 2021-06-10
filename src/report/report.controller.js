const express = require("express");
const router = express.Router();

const authentication = require("../shared/middleware/auth.middleware");
const validation = require("../shared/middleware/validation.middleware");
const response = require("../shared/utils/response");
const rules = require("./report.rules");

const reportService = require("./report.service");

router.post(
  "/",
  authentication(),
  validation(rules.createReport),
  (req, res) => {
    reportService
      .addReport(req.body, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.delete(
  "/:reportId",
  authentication(),
  validation(rules.deleteReport),
  (req, res) => {
    reportService
      .deleteReport(req.params.reportId, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

module.exports = router;
