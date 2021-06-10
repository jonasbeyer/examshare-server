const express = require("express"),
      router  = express.Router();

router.get("/", (req, res) => res.render("index"));
router.get("/agb", (req, res) => res.render("agb"));
router.get("/impressum", (req, res) => res.render("impressum"));
router.get("/datenschutzerklaerung", (req, res) => res.render("datenschutzerklaerung"));

module.exports = router;
