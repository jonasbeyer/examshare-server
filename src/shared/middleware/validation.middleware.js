const { validationResult } = require("express-validator");
const response = require("../utils/response");

module.exports = function validate(rules) {
  return [rules, validateRequest];
};

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(response.BAD_REQUEST);
  }

  next();
}
