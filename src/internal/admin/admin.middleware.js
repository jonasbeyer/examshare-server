const userService = require("../../user/user.service");
const response = require("../../shared/utils/response");

module.exports = () => (req, res, next) => {
  userService
    .isAdministrationAllowed(req.userId)
    .then(() => next())
    .catch(() => res.json(response.UNAUTHORIZED));
};
