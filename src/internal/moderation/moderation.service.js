const userService = require("../../user/user.service");
const taskService = require("../../task/task.service");
const reportService = require("../../report/report.service");
const response = require("../../shared/utils/response");

async function getItems(query, userId) {
  const itemType = query.itemType;
  const limit = __config.values.pageCount;
  const lastIdFilter = query.cursor ? { $lt: lastId } : { $ne: 0 };

  const user = await userService.findUserById(userId, {
    role: 1,
    favorites: 1,
  });

  if (!user.canModerate()) {
    throw response.UNAUTHORIZED;
  }

  return itemType === 0
    ? taskService.findUserTasks({ _id: lastIdFilter }, user, limit)
    : reportService.loadReports(user, query.cursor, limit);
}

module.exports = {
  getItems: getItems,
};
