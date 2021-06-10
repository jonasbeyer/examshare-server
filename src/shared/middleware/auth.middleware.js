const { header, validationResult } = require("express-validator");
const response = require("../utils/response");

const sessionService = require("../../auth/auth.service");

const validations = [
  header("authorization")
    .isString()
    .trim()
    .customSanitizer((value) => value.split(" ")[1]),
  header("user-agent")
    .isString()
    .trim()
    .optional()
    .isLength({ min: 1, max: 130 }),
];

module.exports = () => async (req, res, next) => {
  validateHeaders(req)
    .then(() => sessionService.getSession(req.headers.authorization))
    .then((session) => sessionService.updateSession(req.headers, session))
    .then((session) => {
      req.userId = session.userId;
      next();
    })
    .catch((error) => res.json(error));
};

async function validateHeaders(request) {
  await Promise.all(validations.map((validation) => validation.run(request)));

  // Format: Bearer <token>
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    throw response.BAD_REQUEST;
  }
}
